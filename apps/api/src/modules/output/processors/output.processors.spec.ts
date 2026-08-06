import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionBlueprint } from '../../planning/models/execution-blueprint.models';
import { CapabilityResolver } from './capability.resolver';
import { ExecutionContractBuilder } from './execution-contract.builder';
import { IntentConsolidator } from './intent.consolidator';
import { TransitionValidator } from './transition.validator';

function sampleBlueprint(
  overrides: Partial<ExecutionBlueprint> = {},
): ExecutionBlueprint {
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
    groupId: 'g1',
    parentTaskId: 'task-a',
    kind: 'validate' as const,
    title: 'validate_preconditions',
    description: 'Validate preconditions',
    order: 2,
  };
  const taskC = {
    id: 'task-c',
    groupId: 'g2',
    kind: 'execute' as const,
    title: 'enact_selected_action',
    description: 'Enact action with search lookup',
    order: 3,
  };

  return {
    requestId: 'req-out-1',
    userId: 'u1',
    organizationId: 'o1',
    goal: 'understand:analysis_request',
    strategy: {
      strategyId: 'strat-1',
      name: 'strategy:goal_aligned_reasoning',
      summary: 'Design execution strategy',
      selectedActionId: 'act-1',
      selectedActionTitle: 'goal_aligned_reasoning',
      objectives: [
        {
          id: 'obj-1',
          description: 'Realize selected action',
          priority: 'normal',
        },
      ],
      milestones: [
        { id: 'm1', name: 'prepare', description: 'prep', order: 1 },
      ],
      successCriteria: ['Prepared for downstream execution'],
      failureCriteria: ['Cannot decompose'],
      constraints: ['commitment:standard'],
      metadata: { approvalRequired: false },
    },
    objectives: [
      {
        id: 'obj-1',
        description: 'Realize selected action',
        priority: 'normal',
      },
    ],
    milestones: [{ id: 'm1', name: 'prepare', description: 'prep', order: 1 }],
    tasks: [taskA, taskB, taskC],
    dependencyGraph: {
      edges: [
        {
          id: 'e1',
          fromTaskId: 'task-a',
          toTaskId: 'task-b',
          type: 'prerequisite',
        },
        {
          id: 'e2',
          fromTaskId: 'task-a',
          toTaskId: 'task-c',
          type: 'sequence',
        },
      ],
      prerequisites: { 'task-b': ['task-a'], 'task-c': ['task-a'] },
      parallelGroups: [],
      sequentialChains: [['task-a', 'task-b']],
      executionConstraints: ['no_runtime_scheduling'],
    },
    constraints: ['commitment:standard', 'no_runtime_scheduling'],
    successCriteria: ['Prepared for downstream execution'],
    failureCriteria: ['Cannot decompose'],
    metadata: {
      schemaVersion: '1.0.0',
      plannedAt: new Date().toISOString(),
      taskCount: 3,
      groupCount: 2,
      edgeCount: 2,
      commitmentLevel: 'standard',
      approvalRequired: false,
      extras: { strategyId: 'strat-1' },
    },
    ...overrides,
  };
}

describe('IntentConsolidator', () => {
  it('merges blueprint into IntentContext without changing planning logic', () => {
    const blueprint = sampleBlueprint();
    const ctx = new IntentConsolidator(new ConfigService()).consolidate(blueprint, {
      blueprint,
    });
    assert.equal(ctx.requestId, blueprint.requestId);
    assert.equal(ctx.goal, blueprint.goal);
    assert.equal(ctx.strategy.strategyId, blueprint.strategy.strategyId);
    assert.equal(ctx.tasks.length, 3);
    assert.throws(
      () =>
        new IntentConsolidator(new ConfigService()).consolidate(null as never, {
          blueprint,
        }),
      /required/i,
    );
  });
});

describe('CapabilityResolver + ContractBuilder + TransitionValidator', () => {
  it('resolves capabilities and builds validated ExecutionIntent', () => {
    const blueprint = sampleBlueprint();
    const input = { blueprint, outputHints: { traceId: 'trace-fixed' } };
    const ctx = new IntentConsolidator(new ConfigService()).consolidate(blueprint, input);
    const caps = new CapabilityResolver().resolve(ctx, input);
    assert.ok(caps.names.includes('reasoning'));
    assert.ok(caps.names.includes('knowledge'));
    assert.ok(caps.names.includes('search'));

    const draft = new ExecutionContractBuilder().build(ctx, caps, input);
    assert.equal(draft.traceId, 'trace-fixed');
    assert.equal(draft.metadata.transitionReady, false);

    const intent = new TransitionValidator().validate(draft);
    assert.equal(intent.metadata.schemaVersion, '1.0.0');
    assert.equal(intent.metadata.transitionReady, true);
    assert.equal(intent.metadata.executionReady, true);
    assert.equal(intent.capabilities.names.includes('reasoning'), true);
  });

  it('rejects incomplete capability set', () => {
    const blueprint = sampleBlueprint();
    const input = { blueprint };
    const ctx = new IntentConsolidator(new ConfigService()).consolidate(blueprint, input);
    const caps = new CapabilityResolver().resolve(ctx, input);
    const draft = new ExecutionContractBuilder().build(ctx, caps, input);
    assert.throws(
      () =>
        new TransitionValidator().validate({
          ...draft,
          capabilities: {
            requirements: [],
            names: [],
            summary: 'empty',
          },
        }),
      /capabilities/i,
    );
  });
});
