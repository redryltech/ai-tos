import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionIntent } from '../output/models/execution-intent.models';
import { WORKFLOW_EVENTS } from './events/workflow.events';
import type { ExecutableWorkflow } from './models/workflow.models';
import { DependencyGraphBuilder } from './processors/dependency.graph.builder';
import { ExecutableWorkflowBuilder } from './processors/executable.workflow.builder';
import { ExecutionStrategyBuilder } from './processors/execution.strategy.builder';
import { WorkflowBuilder } from './processors/workflow.builder';
import { WorkflowContextManager } from './processors/workflow.context.manager';
import { WorkflowController } from './processors/workflow.controller';
import { WorkflowValidator } from './processors/workflow.validator';
import { WorkflowService } from './workflow.service';

function sampleIntent(
  overrides: Partial<ExecutionIntent> = {},
): ExecutionIntent {
  return {
    requestId: 'req-api-wf',
    userId: 'u1',
    organizationId: 'org1',
    goal: 'compile:public_api',
    objectives: [
      { id: 'obj-1', description: 'Compile', priority: 'normal' },
    ],
    strategy: {
      strategyId: 'strat-1',
      name: 'strategy:goal_aligned_reasoning',
      summary: 'Compile workflow',
      selectedActionId: 'act-1',
      selectedActionTitle: 'goal_aligned_reasoning',
      objectives: [
        { id: 'obj-1', description: 'Compile', priority: 'normal' },
      ],
      milestones: [],
      successCriteria: ['ok'],
      failureCriteria: ['fail'],
      constraints: [],
      metadata: {},
    },
    tasks: [
      {
        id: 'task-a',
        groupId: 'g1',
        kind: 'prepare',
        title: 'prepare',
        description: 'Prepare',
        order: 1,
      },
      {
        id: 'task-b',
        groupId: 'g2',
        kind: 'execute',
        title: 'execute',
        description: 'Execute',
        order: 2,
      },
    ],
    dependencyGraph: {
      edges: [
        {
          id: 'e1',
          fromTaskId: 'task-a',
          toTaskId: 'task-b',
          type: 'sequence',
        },
      ],
      prerequisites: { 'task-b': ['task-a'] },
      parallelGroups: [],
      sequentialChains: [['task-a', 'task-b']],
      executionConstraints: [],
    },
    capabilities: {
      requirements: [{ name: 'reasoning', reason: 'core', required: true }],
      names: ['reasoning'],
      summary: 'reasoning',
    },
    constraints: [],
    successCriteria: ['ok'],
    failureCriteria: ['fail'],
    priority: 'normal',
    traceId: 'trace-api-wf',
    metadata: {
      schemaVersion: '1.0.0',
      builtAt: new Date().toISOString(),
      transitionReady: true,
      executionReady: true,
      capabilityCount: 1,
      taskCount: 2,
      extras: {},
    },
    ...overrides,
  };
}

function assertWorkflowContract(workflow: ExecutableWorkflow): void {
  assert.ok(workflow.id);
  assert.ok(workflow.workflowGraph);
  assert.ok(workflow.executionStrategy);
  assert.ok(Array.isArray(workflow.tasks));
  assert.ok(workflow.context);
  assert.ok(workflow.metadata);
  assert.ok(workflow.traceId);
  assert.ok(workflow.version);
  assert.ok(workflow.createdAt);
}

function createService(): { service: WorkflowService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('workflow.#', (e) => {
    events.push(e.topic);
  });

  const controller = new WorkflowController(
    new WorkflowBuilder(),
    new DependencyGraphBuilder(),
    new WorkflowValidator(config),
    new ExecutionStrategyBuilder(config),
    new WorkflowContextManager(),
    new ExecutableWorkflowBuilder(),
  );

  const service = new WorkflowService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('WorkflowService public API', () => {
  let service: WorkflowService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('createWorkflow returns ExecutableWorkflow and emits started/completed', async () => {
    const result = await service.createWorkflow(sampleIntent());
    assertWorkflowContract(result);
    assert.equal(result.tasks.length, 2);
    assert.ok(events.includes(WORKFLOW_EVENTS.started));
    assert.ok(events.includes(WORKFLOW_EVENTS.completed));
  });

  it('emits failed for cyclic workflow', async () => {
    await assert.rejects(
      () =>
        service.createWorkflow(
          sampleIntent({
            dependencyGraph: {
              edges: [
                {
                  id: 'e1',
                  fromTaskId: 'task-a',
                  toTaskId: 'task-b',
                  type: 'sequence',
                },
                {
                  id: 'e2',
                  fromTaskId: 'task-b',
                  toTaskId: 'task-a',
                  type: 'sequence',
                },
              ],
              prerequisites: {},
              parallelGroups: [],
              sequentialChains: [],
              executionConstraints: [],
            },
          }),
        ),
      /Cyclic/,
    );
    assert.ok(events.includes(WORKFLOW_EVENTS.failed));
  });
});

describe('Workflow contract', () => {
  it('keeps identical top-level ExecutableWorkflow keys', async () => {
    const { service } = createService();
    const a = await service.createWorkflow(sampleIntent());
    const b = await service.createWorkflow(
      sampleIntent({
        requestId: 'req-api-wf-2',
        dependencyGraph: {
          edges: [],
          prerequisites: {},
          parallelGroups: [['task-a', 'task-b']],
          sequentialChains: [],
          executionConstraints: [],
        },
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
