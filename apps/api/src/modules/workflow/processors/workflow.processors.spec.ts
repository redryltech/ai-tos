import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionIntent } from '../../output/models/execution-intent.models';
import { DependencyGraphBuilder } from './dependency.graph.builder';
import { ExecutableWorkflowBuilder } from './executable.workflow.builder';
import { ExecutionStrategyBuilder } from './execution.strategy.builder';
import { WorkflowBuilder } from './workflow.builder';
import { WorkflowContextManager } from './workflow.context.manager';
import { WorkflowValidator } from './workflow.validator';
import { WorkflowValidationError } from '../models/workflow.models';

function sampleIntent(
  overrides: Partial<ExecutionIntent> = {},
): ExecutionIntent {
  const taskA = {
    id: 'task-a',
    groupId: 'g1',
    kind: 'prepare' as const,
    title: 'prepare_context',
    description: 'Prepare context',
    order: 1,
  };
  const taskB = {
    id: 'task-b',
    groupId: 'g2',
    kind: 'execute' as const,
    title: 'enact_selected_action',
    description: 'Enact selected action',
    order: 2,
  };

  return {
    requestId: 'req-wf-1',
    userId: 'u1',
    organizationId: 'org1',
    goal: 'compile:workflow',
    objectives: [
      { id: 'obj-1', description: 'Compile workflow', priority: 'normal' },
    ],
    strategy: {
      strategyId: 'strat-1',
      name: 'strategy:goal_aligned_reasoning',
      summary: 'Design execution strategy',
      selectedActionId: 'act-1',
      selectedActionTitle: 'goal_aligned_reasoning',
      objectives: [
        { id: 'obj-1', description: 'Compile workflow', priority: 'normal' },
      ],
      milestones: [],
      successCriteria: ['Workflow compiled'],
      failureCriteria: ['Invalid structure'],
      constraints: [],
      metadata: {},
    },
    tasks: [taskA, taskB],
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
      requirements: [
        { name: 'reasoning', reason: 'core', required: true },
      ],
      names: ['reasoning'],
      summary: 'reasoning',
    },
    constraints: [],
    successCriteria: ['Workflow compiled'],
    failureCriteria: ['Invalid structure'],
    priority: 'normal',
    traceId: 'trace-wf-1',
    metadata: {
      schemaVersion: '1.0.0',
      builtAt: new Date().toISOString(),
      transitionReady: true,
      executionReady: true,
      capabilityCount: 1,
      taskCount: 2,
      extras: {
        policyReferences: 'policy:global',
        memoryReferences: 'memory:session',
        knowledgeReferences: 'knowledge:docs',
        variables: JSON.stringify({ region: 'us' }),
      },
    },
    ...overrides,
  };
}

describe('WorkflowBuilder', () => {
  it('transforms intent into draft without building graph', () => {
    const draft = new WorkflowBuilder().build(sampleIntent());
    assert.equal(draft.nodes.length, 2);
    assert.equal(draft.goal, 'compile:workflow');
    assert.deepEqual(draft.capabilityNames, ['reasoning']);
  });
});

describe('DependencyGraphBuilder', () => {
  it('builds DAG with topological order', () => {
    const intent = sampleIntent();
    const draft = new WorkflowBuilder().build(intent);
    const graph = new DependencyGraphBuilder().build(draft, intent);
    assert.equal(graph.edges.length, 1);
    assert.deepEqual(graph.topologicalOrder, ['task-a', 'task-b']);
    assert.deepEqual(graph.roots, ['task-a']);
    assert.deepEqual(graph.leaves, ['task-b']);
  });
});

describe('WorkflowValidator', () => {
  it('accepts valid sequential workflow', () => {
    const intent = sampleIntent();
    const draft = new WorkflowBuilder().build(intent);
    const graph = new DependencyGraphBuilder().build(draft, intent);
    assert.doesNotThrow(() =>
      new WorkflowValidator(new ConfigService()).validate(draft, graph),
    );
  });

  it('rejects empty workflow', () => {
    const intent = sampleIntent({
      tasks: [],
      dependencyGraph: {
        edges: [],
        prerequisites: {},
        parallelGroups: [],
        sequentialChains: [],
        executionConstraints: [],
      },
      metadata: {
        schemaVersion: '1.0.0',
        builtAt: new Date().toISOString(),
        transitionReady: true,
        executionReady: true,
        capabilityCount: 1,
        taskCount: 0,
        extras: {},
      },
    });
    const draft = new WorkflowBuilder().build(intent);
    const graph = new DependencyGraphBuilder().build(draft, intent);
    assert.throws(
      () => new WorkflowValidator(new ConfigService()).validate(draft, graph),
      WorkflowValidationError,
    );
  });

  it('rejects cyclic dependencies', () => {
    const intent = sampleIntent({
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
    });
    const draft = new WorkflowBuilder().build(intent);
    const graph = new DependencyGraphBuilder().build(draft, intent);
    assert.throws(
      () => new WorkflowValidator(new ConfigService()).validate(draft, graph),
      /Cyclic/,
    );
  });

  it('rejects duplicate nodes', () => {
    const intent = sampleIntent();
    const draft = new WorkflowBuilder().build(intent);
    const dup = Object.freeze({
      ...draft,
      nodes: Object.freeze([draft.nodes[0]!, draft.nodes[0]!]),
    });
    const graph = new DependencyGraphBuilder().build(draft, intent);
    assert.throws(
      () => new WorkflowValidator(new ConfigService()).validate(dup, graph),
      /Duplicate/,
    );
  });
});

describe('ExecutionStrategyBuilder', () => {
  it('selects sequential for linear chain', () => {
    const intent = sampleIntent();
    const draft = new WorkflowBuilder().build(intent);
    const graph = new DependencyGraphBuilder().build(draft, intent);
    const strategy = new ExecutionStrategyBuilder(new ConfigService()).build(
      draft,
      graph,
    );
    assert.equal(strategy.kind, 'sequential');
    assert.equal(strategy.maxConcurrency, 1);
  });

  it('selects parallel when no edges', () => {
    const intent = sampleIntent({
      dependencyGraph: {
        edges: [],
        prerequisites: {},
        parallelGroups: [['task-a', 'task-b']],
        sequentialChains: [],
        executionConstraints: [],
      },
    });
    const draft = new WorkflowBuilder().build(intent);
    const graph = new DependencyGraphBuilder().build(draft, intent);
    const strategy = new ExecutionStrategyBuilder(new ConfigService()).build(
      draft,
      graph,
    );
    assert.equal(strategy.kind, 'parallel');
  });
});

describe('WorkflowContextManager + ExecutableWorkflowBuilder', () => {
  it('builds immutable context and executable workflow', () => {
    const intent = sampleIntent();
    const draft = new WorkflowBuilder().build(intent);
    const graph = new DependencyGraphBuilder().build(draft, intent);
    new WorkflowValidator(new ConfigService()).validate(draft, graph);
    const strategy = new ExecutionStrategyBuilder(new ConfigService()).build(
      draft,
      graph,
    );
    const context = new WorkflowContextManager().build(intent);
    assert.equal(context.executionIntent.requestId, intent.requestId);
    assert.deepEqual(context.policyReferences, ['policy:global']);
    assert.equal(context.variables.region, 'us');

    const workflow = new ExecutableWorkflowBuilder().build(
      draft,
      graph,
      strategy,
      context,
    );
    assert.ok(workflow.id);
    assert.equal(workflow.tasks.length, 2);
    assert.equal(workflow.version, '1.0.0');
    assert.equal(workflow.traceId, 'trace-wf-1');
    assert.equal(workflow.metadata.nodeCount, 2);
  });
});
