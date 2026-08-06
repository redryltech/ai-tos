import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { Decision } from '../../decision/models/decision.models';
import { DependencyDesigner } from './dependency.designer';
import { ExecutionBlueprintBuilder } from './execution-blueprint.builder';
import { StrategyDesigner } from './strategy.designer';
import { TaskDecomposer } from './task.decomposer';

function sampleDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    requestId: 'req-plan-1',
    userId: 'u1',
    organizationId: 'o1',
    goal: 'understand:analysis_request',
    selectedAction: {
      id: 'act-1',
      title: 'goal_aligned_reasoning',
      summary: 'Primary path',
      sourceCandidateId: 'cand-1',
      score: 0.9,
    },
    rejectedAlternatives: [
      {
        id: 'rej-1',
        title: 'risk_aware_reasoning',
        summary: 'Secondary',
        sourceCandidateId: 'cand-2',
        score: 0.7,
        rejectionReason: 'lower score',
      },
    ],
    evidenceSummary: 'Evidence acceptable',
    constraintSummary: 'Constraints satisfied',
    risk: [],
    confidence: 0.82,
    approvalRequired: false,
    decisionReason: 'Committed to goal_aligned_reasoning',
    commitmentLevel: 'standard',
    metadata: {
      schemaVersion: '1.0.0',
      decidedAt: new Date().toISOString(),
      priority: 'normal',
      tradeoffs: [],
      evidenceValid: true,
      constraintsValid: true,
      extras: {},
    },
    ...overrides,
  };
}

describe('StrategyDesigner', () => {
  it('builds strategy with objectives milestones criteria', () => {
    const decision = sampleDecision();
    const strategy = new StrategyDesigner().design(decision, { decision });
    assert.ok(strategy.strategyId);
    assert.equal(strategy.selectedActionTitle, 'goal_aligned_reasoning');
    assert.ok(strategy.objectives.length >= 2);
    assert.ok(strategy.milestones.length >= 3);
    assert.ok(strategy.successCriteria.length > 0);
    assert.ok(strategy.failureCriteria.length > 0);
    assert.throws(
      () => new StrategyDesigner().design(null as never, { decision }),
      /required/i,
    );
  });
});

describe('TaskDecomposer + DependencyDesigner + BlueprintBuilder', () => {
  it('decomposes tasks, designs dependencies, builds canonical blueprint', () => {
    const decision = sampleDecision({ approvalRequired: true });
    const strategy = new StrategyDesigner().design(decision, {
      decision,
      planHints: { preferParallel: true, includeVerification: true },
    });
    const taskPlan = new TaskDecomposer(new ConfigService()).decompose(strategy, {
      decision,
    });
    assert.ok(taskPlan.tasks.length >= 4);
    assert.ok(taskPlan.groups.length >= 2);
    assert.ok(taskPlan.logicalOrder.length === taskPlan.tasks.length);
    assert.ok(taskPlan.tasks.some((t) => t.title === 'approval_gate'));

    const graph = new DependencyDesigner().design(strategy, taskPlan);
    assert.ok(graph.edges.length > 0);
    assert.ok(graph.executionConstraints.includes('no_runtime_scheduling'));

    const blueprint = new ExecutionBlueprintBuilder().build(
      decision,
      strategy,
      taskPlan,
      graph,
    );
    assert.equal(blueprint.metadata.schemaVersion, '1.0.0');
    assert.equal(blueprint.requestId, decision.requestId);
    assert.ok(blueprint.tasks.length > 0);
    assert.ok(blueprint.dependencyGraph.edges.length > 0);
  });
});
