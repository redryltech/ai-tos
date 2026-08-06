import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import type { Decision } from '../decision/models/decision.models';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { PLANNING_EVENTS } from './events/planning.events';
import type { ExecutionBlueprint } from './models/execution-blueprint.models';
import { PlanningService } from './planning.service';
import { DependencyDesigner } from './processors/dependency.designer';
import { ExecutionBlueprintBuilder } from './processors/execution-blueprint.builder';
import { StrategyDesigner } from './processors/strategy.designer';
import { TaskDecomposer } from './processors/task.decomposer';

function sampleDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    requestId: 'req-api-plan',
    userId: 'u1',
    organizationId: 'org1',
    goal: 'understand:analysis_request',
    selectedAction: {
      id: 'act-1',
      title: 'goal_aligned_reasoning',
      summary: 'Primary path',
      sourceCandidateId: 'cand-1',
      score: 0.9,
    },
    rejectedAlternatives: [],
    evidenceSummary: 'ok',
    constraintSummary: 'ok',
    risk: [],
    confidence: 0.8,
    approvalRequired: false,
    decisionReason: 'Committed',
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

function assertBlueprintContract(blueprint: ExecutionBlueprint): void {
  assert.deepEqual(Object.keys(blueprint).sort(), [
    'constraints',
    'dependencyGraph',
    'failureCriteria',
    'goal',
    'metadata',
    'milestones',
    'objectives',
    'organizationId',
    'requestId',
    'strategy',
    'successCriteria',
    'tasks',
    'userId',
  ]);
  assert.equal(blueprint.metadata.schemaVersion, '1.0.0');
  assert.ok(blueprint.tasks.length > 0);
  assert.ok(blueprint.strategy.strategyId);
}

function createService(): { service: PlanningService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('planning.#', (e) => {
    events.push(e.topic);
  });

  const service = new PlanningService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    new StrategyDesigner(),
    new TaskDecomposer(config),
    new DependencyDesigner(),
    new ExecutionBlueprintBuilder(),
  );
  return { service, events };
}

describe('PlanningService public API', () => {
  let service: PlanningService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('plan returns ExecutionBlueprint and emits started/completed', async () => {
    const blueprint = await service.plan(sampleDecision());
    assertBlueprintContract(blueprint);
    assert.equal(blueprint.strategy.selectedActionTitle, 'goal_aligned_reasoning');
    assert.ok(events.includes(PLANNING_EVENTS.started));
    assert.ok(events.includes(PLANNING_EVENTS.completed));
  });

  it('accepts PlanInputDto with planHints', async () => {
    const blueprint = await service.plan({
      decision: sampleDecision({ approvalRequired: true }),
      planHints: { preferParallel: false, includeVerification: true },
    });
    assertBlueprintContract(blueprint);
    assert.ok(blueprint.tasks.some((t) => t.title === 'approval_gate'));
  });

  it('emits failed and rethrows on invalid decision', async () => {
    await assert.rejects(() => service.plan({ requestId: '' } as never), /required/i);
    assert.ok(events.includes(PLANNING_EVENTS.failed));
  });
});

describe('Planning pipeline contract', () => {
  it('keeps identical top-level ExecutionBlueprint structure', async () => {
    const { service } = createService();
    const a = await service.plan(sampleDecision());
    const b = await service.plan(
      sampleDecision({
        requestId: 'req-2',
        approvalRequired: true,
        commitmentLevel: 'tentative',
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    assert.deepEqual(Object.keys(a.metadata).sort(), Object.keys(b.metadata).sort());
  });
});
