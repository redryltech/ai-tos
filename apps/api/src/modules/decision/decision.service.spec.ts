import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { Thought } from '../thinking/models/thought.models';
import { DecisionService } from './decision.service';
import { DECISION_EVENTS } from './events/decision.events';
import type { Decision } from './models/decision.models';
import { CommitmentManager } from './processors/commitment.manager';
import { ConstraintValidator } from './processors/constraint.validator';
import { EvidenceValidator } from './processors/evidence.validator';
import { JudgmentCore } from './processors/judgment.core';

function sampleThought(overrides: Partial<Thought> = {}): Thought {
  const c1 = {
    id: 'cand-1',
    title: 'goal_aligned_reasoning',
    summary: 'Primary path',
    rationale: 'best',
    score: 0.9,
    relatedStepIds: ['s1'] as const,
  };
  const c2 = {
    id: 'cand-2',
    title: 'risk_aware_reasoning',
    summary: 'Secondary path',
    rationale: 'alt',
    score: 0.7,
    relatedStepIds: ['s2'] as const,
  };

  return {
    requestId: 'req-api-dec',
    userId: 'u1',
    organizationId: 'org1',
    goal: 'understand:analysis_request',
    thinkingContext: {
      requestId: 'req-api-dec',
      goal: 'understand:analysis_request',
      intent: 'analysis_request',
      language: 'en',
      priority: 'normal',
      emotion: 'neutral',
      inputType: 'text',
      objectIds: [],
      relationshipIds: [],
      constraintIds: [],
      unknownFields: [],
      safetyCategories: [],
      perceptionConfidence: 0.8,
      environment: {},
      metadata: {},
      builtAt: new Date().toISOString(),
    },
    knowledgeContext: {
      facts: [
        {
          id: 'f1',
          source: 'world',
          key: 'goal',
          value: 'g',
          confidence: 0.8,
        },
      ],
      conversationNotes: [],
      systemNotes: [],
      coverageScore: 0.75,
      metadata: {},
    },
    reasoning: {
      steps: [
        { id: 's1', kind: 'logical', premise: 'p', inference: 'i', support: [] },
        { id: 's2', kind: 'causal', premise: 'p', inference: 'i', support: [] },
        { id: 's3', kind: 'hypothesis', premise: 'p', inference: 'i', support: [] },
      ],
      hypotheses: [],
      alternatives: [],
      candidateSolutions: [c1, c2],
      assumptions: [],
    },
    candidateSolutions: [c1, c2],
    assumptions: [],
    constraints: [],
    risks: [],
    confidence: 0.82,
    recommendation: 'Strongest reasoned direction: goal_aligned_reasoning',
    metadata: {
      schemaVersion: '1.0.0',
      thoughtAt: new Date().toISOString(),
      rankedCandidateIds: ['cand-1', 'cand-2'],
      evaluation: {
        quality: 0.8,
        confidence: 0.82,
        risk: 0.1,
        completeness: 0.8,
        consistency: 0.8,
      },
      missingInformation: [],
      weakAssumptions: [],
      extras: {},
    },
    ...overrides,
  };
}

function assertDecisionContract(decision: Decision): void {
  assert.deepEqual(Object.keys(decision).sort(), [
    'approvalRequired',
    'commitmentLevel',
    'confidence',
    'constraintSummary',
    'decisionReason',
    'evidenceSummary',
    'goal',
    'metadata',
    'organizationId',
    'rejectedAlternatives',
    'requestId',
    'risk',
    'selectedAction',
    'userId',
  ]);
  assert.equal(decision.metadata.schemaVersion, '1.0.0');
  assert.ok(decision.selectedAction.id);
  assert.ok(typeof decision.approvalRequired === 'boolean');
}

function createService(): { service: DecisionService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('decision.#', (e) => {
    events.push(e.topic);
  });

  const service = new DecisionService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    new EvidenceValidator(),
    new ConstraintValidator(),
    new JudgmentCore(config),
    new CommitmentManager(),
  );
  return { service, events };
}

describe('DecisionService public API', () => {
  let service: DecisionService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('decide returns Decision and emits started/completed', async () => {
    const decision = await service.decide(sampleThought());
    assertDecisionContract(decision);
    assert.equal(decision.selectedAction.sourceCandidateId, 'cand-1');
    assert.ok(events.includes(DECISION_EVENTS.started));
    assert.ok(events.includes(DECISION_EVENTS.completed));
  });

  it('accepts DecideInputDto with policy hints', async () => {
    const decision = await service.decide({
      thought: sampleThought(),
      policyHints: { requireOrganization: true, permissionLevel: 'read' },
    });
    assertDecisionContract(decision);
    assert.equal(decision.metadata.constraintsValid, true);
  });

  it('emits failed and rethrows on invalid thought', async () => {
    await assert.rejects(() => service.decide({ requestId: '' } as never), /required/i);
    assert.ok(events.includes(DECISION_EVENTS.failed));
  });
});

describe('Decision pipeline contract', () => {
  it('keeps identical top-level Decision structure across inputs', async () => {
    const { service } = createService();
    const a = await service.decide(sampleThought());
    const b = await service.decide(
      sampleThought({
        requestId: 'req-2',
        confidence: 0.5,
        risks: [
          {
            id: 'r1',
            category: 'knowledge_gap',
            description: 'gap',
            severity: 'warning',
          },
        ],
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    assert.deepEqual(Object.keys(a.metadata).sort(), Object.keys(b.metadata).sort());
  });
});
