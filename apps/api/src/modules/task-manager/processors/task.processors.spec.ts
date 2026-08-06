import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutableWorkflow } from '../../workflow/models/workflow.models';
import { ExecutableTaskBuilder } from './executable.task.builder';
import { TaskBuilder } from './task.builder';
import { TaskDependencyManager } from './task.dependency.manager';
import { TaskDispatcher } from './task.dispatcher';
import { TaskLifecycleManager } from './task.lifecycle.manager';
import { TaskValidationError } from '../models/task.models';

function sampleWorkflow(
  overrides: Partial<ExecutableWorkflow> = {},
): ExecutableWorkflow {
  const nodes = [
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
  ];

  return {
    id: 'wf-1',
    workflowGraph: Object.freeze({
      nodes: Object.freeze(nodes),
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
      traceId: 'trace-tm-1',
      requestId: 'req-tm-1',
      metadata: Object.freeze({}),
      variables: Object.freeze({}),
      policyReferences: Object.freeze([]) as readonly string[],
      memoryReferences: Object.freeze([]) as readonly string[],
      knowledgeReferences: Object.freeze([]) as readonly string[],
    }),
    metadata: Object.freeze({
      schemaVersion: '1.0.0' as const,
      goal: 'compile:tasks',
      nodeCount: 2,
      edgeCount: 1,
      strategyKind: 'sequential' as const,
      extras: Object.freeze({}),
    }),
    traceId: 'trace-tm-1',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('TaskBuilder', () => {
  it('converts workflow tasks into drafts with new ids', () => {
    const drafts = new TaskBuilder(new ConfigService()).build(sampleWorkflow());
    assert.equal(drafts.length, 2);
    assert.ok(drafts[0]!.id);
    assert.notEqual(drafts[0]!.id, 'task:task-a');
    assert.equal(drafts[0]!.workflowId, 'wf-1');
  });

  it('rejects empty workflow when not allowed', () => {
    assert.throws(
      () =>
        new TaskBuilder(new ConfigService()).build(
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
      TaskValidationError,
    );
  });
});

describe('TaskDependencyManager', () => {
  it('resolves node dependency refs and preserves order', () => {
    const drafts = new TaskBuilder(new ConfigService()).build(sampleWorkflow());
    const graph = new TaskDependencyManager().build(drafts);
    assert.equal(graph.drafts.length, 2);
    assert.equal(graph.topologicalOrder.length, 2);
    assert.equal(graph.roots.length, 1);
    const dependent = graph.drafts.find((d) => d.nodeId === 'task-b')!;
    assert.equal(dependent.dependencyIds.length, 1);
    assert.equal(dependent.dependencyIds[0], graph.roots[0]);
  });

  it('rejects invalid dependency references', () => {
    const drafts = new TaskBuilder(new ConfigService()).build(sampleWorkflow());
    const broken = Object.freeze([
      Object.freeze({
        ...drafts[0]!,
        dependencyIds: Object.freeze(['missing-node']),
      }),
    ]);
    assert.throws(
      () => new TaskDependencyManager().build(broken),
      /Invalid dependency/,
    );
  });
});

describe('TaskLifecycleManager + Dispatcher', () => {
  it('assigns READY/WAITING and prepares dispatch without RUNNING', () => {
    const workflow = sampleWorkflow();
    const drafts = new TaskBuilder(new ConfigService()).build(workflow);
    const graph = new TaskDependencyManager().build(drafts);
    const lifecycle = new TaskLifecycleManager().initialize(
      graph.drafts,
      graph,
    );
    assert.equal(lifecycle.filter((t) => t.state === 'READY').length, 1);
    assert.equal(lifecycle.filter((t) => t.state === 'WAITING').length, 1);
    assert.ok(lifecycle.every((t) => t.state !== 'RUNNING'));

    const collection = new ExecutableTaskBuilder().build(lifecycle, workflow);
    const prepared = new TaskDispatcher().prepare(collection);
    assert.equal(prepared.metadata.dispatchPrepared, true);
    assert.equal(prepared.metadata.readyCount, 1);
    assert.ok(prepared.tasks.every((t) => t.state !== 'RUNNING'));
    const ready = prepared.tasks.find((t) => t.state === 'READY')!;
    assert.equal(ready.metadata.dispatchReady, true);
  });
});
