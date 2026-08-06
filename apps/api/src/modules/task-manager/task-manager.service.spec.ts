import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutableWorkflow } from '../workflow/models/workflow.models';
import { TASK_EVENTS } from './events/task.events';
import type { ExecutableTaskCollection } from './models/task.models';
import { ExecutableTaskBuilder } from './processors/executable.task.builder';
import { TaskBuilder } from './processors/task.builder';
import { TaskController } from './processors/task.controller';
import { TaskDependencyManager } from './processors/task.dependency.manager';
import { TaskDispatcher } from './processors/task.dispatcher';
import { TaskLifecycleManager } from './processors/task.lifecycle.manager';
import { TaskManagerService } from './task-manager.service';

function sampleWorkflow(
  overrides: Partial<ExecutableWorkflow> = {},
): ExecutableWorkflow {
  return {
    id: 'wf-api-1',
    workflowGraph: Object.freeze({
      nodes: Object.freeze([
        Object.freeze({
          id: 'task-a',
          title: 'prepare',
          description: 'Prepare',
          kind: 'prepare',
          order: 0,
          capabilityHints: Object.freeze([]) as readonly string[],
          metadata: Object.freeze({}),
        }),
        Object.freeze({
          id: 'task-b',
          title: 'execute',
          description: 'Execute',
          kind: 'execute',
          order: 1,
          capabilityHints: Object.freeze([]) as readonly string[],
          metadata: Object.freeze({}),
        }),
      ]),
      edges: Object.freeze([
        Object.freeze({
          id: 'e1',
          fromNodeId: 'task-a',
          toNodeId: 'task-b',
          type: 'sequence' as const,
        }),
      ]),
      adjacency: Object.freeze({ 'task-a': Object.freeze(['task-b']) }),
      reverseAdjacency: Object.freeze({ 'task-b': Object.freeze(['task-a']) }),
      roots: Object.freeze(['task-a']),
      leaves: Object.freeze(['task-b']),
      topologicalOrder: Object.freeze(['task-a', 'task-b']),
    }),
    executionStrategy: Object.freeze({
      kind: 'sequential' as const,
      parallelGroups: Object.freeze([]) as readonly (readonly string[])[],
      sequentialChains: Object.freeze([
        Object.freeze(['task-a', 'task-b']),
      ]) as readonly (readonly string[])[],
      fanOutNodes: Object.freeze([]) as readonly string[],
      fanInNodes: Object.freeze([]) as readonly string[],
      conditionalGates: Object.freeze([]) as readonly string[],
      maxConcurrency: 1,
      summary: 'sequential',
    }),
    tasks: Object.freeze([
      Object.freeze({
        id: 'task:task-a',
        nodeId: 'task-a',
        title: 'prepare',
        kind: 'prepare',
        dependsOn: Object.freeze([]) as readonly string[],
        order: 0,
      }),
      Object.freeze({
        id: 'task:task-b',
        nodeId: 'task-b',
        title: 'execute',
        kind: 'execute',
        dependsOn: Object.freeze(['task-a']),
        order: 1,
      }),
    ]),
    context: Object.freeze({
      executionIntent: {} as ExecutableWorkflow['context']['executionIntent'],
      traceId: 'trace-api-tm',
      requestId: 'req-api-tm',
      metadata: Object.freeze({}),
      variables: Object.freeze({}),
      policyReferences: Object.freeze([]) as readonly string[],
      memoryReferences: Object.freeze([]) as readonly string[],
      knowledgeReferences: Object.freeze([]) as readonly string[],
    }),
    metadata: Object.freeze({
      schemaVersion: '1.0.0' as const,
      goal: 'api:tasks',
      nodeCount: 2,
      edgeCount: 1,
      strategyKind: 'sequential' as const,
      extras: Object.freeze({}),
    }),
    traceId: 'trace-api-tm',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function assertCollectionContract(c: ExecutableTaskCollection): void {
  assert.ok(c.workflowId);
  assert.ok(Array.isArray(c.tasks));
  assert.ok(c.metadata);
  assert.ok(c.createdAt);
  for (const t of c.tasks) {
    assert.ok(t.id);
    assert.ok(t.workflowId);
    assert.ok(Array.isArray(t.dependencyIds));
    assert.ok(t.state);
    assert.ok(t.metadata);
    assert.ok(t.traceId);
    assert.ok(t.createdAt);
  }
}

function createService(): { service: TaskManagerService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('task.#', (e) => {
    events.push(e.topic);
  });

  const controller = new TaskController(
    new TaskBuilder(config),
    new TaskDependencyManager(),
    new TaskLifecycleManager(),
    new ExecutableTaskBuilder(),
    new TaskDispatcher(),
  );

  const service = new TaskManagerService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('TaskManagerService public API', () => {
  let service: TaskManagerService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('createTasks returns collection and emits started/completed', async () => {
    const result = await service.createTasks(sampleWorkflow());
    assertCollectionContract(result);
    assert.equal(result.tasks.length, 2);
    assert.equal(result.metadata.dispatchPrepared, true);
    assert.ok(events.includes(TASK_EVENTS.started));
    assert.ok(events.includes(TASK_EVENTS.completed));
  });

  it('emits failed for empty workflow', async () => {
    await assert.rejects(
      () =>
        service.createTasks(
          sampleWorkflow({
            tasks: Object.freeze([]),
            metadata: Object.freeze({
              schemaVersion: '1.0.0' as const,
              goal: 'empty',
              nodeCount: 0,
              edgeCount: 0,
              strategyKind: 'parallel' as const,
              extras: Object.freeze({}),
            }),
          }),
        ),
      /no tasks/,
    );
    assert.ok(events.includes(TASK_EVENTS.failed));
  });
});

describe('Task Manager contract', () => {
  it('keeps identical top-level ExecutableTaskCollection keys', async () => {
    const { service } = createService();
    const a = await service.createTasks(sampleWorkflow());
    const b = await service.createTasks(
      sampleWorkflow({
        id: 'wf-api-2',
        tasks: Object.freeze([
          Object.freeze({
            id: 'task:only',
            nodeId: 'only',
            title: 'solo',
            kind: 'execute',
            dependsOn: Object.freeze([]) as readonly string[],
            order: 0,
          }),
        ]),
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
