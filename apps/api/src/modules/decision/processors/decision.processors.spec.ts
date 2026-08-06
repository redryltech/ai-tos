import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { Thought } from '../../thinking/models/thought.models';
import { CommitmentManager } from './commitment.manager';
import { ConstraintValidator } from './constraint.validator';
import { EvidenceValidator } from './evidence.validator';
import { JudgmentCore } from './judgment.core';

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
    requestId: 'req-dec-1',
    userId: 'u1',
    organizationId: 'o1',
    goal: 'understand:analysis_request',
    thinkingContext: {
      requestId: 'req-dec-1',
      goal: 'understand:analysis_request',
      intent: 'analysis_request',
      language: 'en',
      priority: 'normal',
      emotion: 'neutral',
      inputType: 'text',
      objectIds: ['primary-input'],
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
          value: 'understand:analysis_request',
          confidence: 0.8,
        },
      ],
      conversationNotes: [],
      systemNotes: ['thinking_engine:layer_3.2'],
      coverageScore: 0.7,
      metadata: {},
    },
    reasoning: {
      steps: [
        {
          id: 's1',
          kind: 'logical',
          premise: 'p',
          inference: 'i',
          support: [],
        },
        {
          id: 's2',
          kind: 'causal',
          premise: 'p',
          inference: 'i',
          support: [],
        },
        {
          id: 's3',
          kind: 'hypothesis',
          premise: 'p',
          inference: 'i',
          support: [],
        },
        {
          id: 's4',
          kind: 'multi_step',
          premise: 'p',
          inference: 'i',
          support: [],
        },
      ],
      hypotheses: ['h1'],
      alternatives: ['a1'],
      candidateSolutions: [c1, c2],
      assumptions: ['a'],
    },
    candidateSolutions: [c1, c2],
    assumptions: ['a'],
    constraints: [],
    risks: [],
    confidence: 0.8,
    recommendation: 'Strongest reasoned direction: goal_aligned_reasoning',
    metadata: {
      schemaVersion: '1.0.0',
      thoughtAt: new Date().toISOString(),
      rankedCandidateIds: ['cand-1', 'cand-2'],
      evaluation: {
        quality: 0.8,
        confidence: 0.8,
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

describe('EvidenceValidator', () => {
  it('validates completeness quality confidence without new reasoning', () => {
    const report = new EvidenceValidator().validate(sampleThought());
    assert.equal(report.valid, true);
    assert.ok(report.completenessScore > 0);
    assert.ok(report.summary.length > 0);
  });

  it('flags missing candidates', () => {
    const report = new EvidenceValidator().validate(
      sampleThought({
        candidateSolutions: [],
        reasoning: {
          ...sampleThought().reasoning,
          candidateSolutions: [],
        },
        metadata: {
          ...sampleThought().metadata,
          rankedCandidateIds: [],
        },
      }),
    );
    assert.equal(report.valid, false);
    assert.ok(report.missingEvidence.includes('candidate_solutions'));
  });
});

describe('ConstraintValidator', () => {
  it('passes baseline constraints and blocks missing org when required', () => {
    const thought = sampleThought();
    const ok = new ConstraintValidator().validate(thought, { thought });
    assert.equal(ok.valid, true);

    const blocked = new ConstraintValidator().validate(
      sampleThought({ organizationId: undefined }),
      { thought, policyHints: { requireOrganization: true } },
    );
    assert.equal(blocked.valid, false);
    assert.ok(blocked.blockingCount >= 1);
  });
});

describe('JudgmentCore + CommitmentManager', () => {
  it('selects one action and builds canonical Decision', () => {
    const thought = sampleThought();
    const evidence = new EvidenceValidator().validate(thought);
    const constraints = new ConstraintValidator().validate(thought, { thought });
    const judgment = new JudgmentCore(new ConfigService()).judge(
      thought,
      evidence,
      constraints,
    );

    assert.equal(judgment.selectedAction.sourceCandidateId, 'cand-1');
    assert.equal(judgment.rejectedAlternatives.length, 1);
    assert.ok(judgment.confidence >= 0 && judgment.confidence <= 1);
    assert.ok(judgment.decisionReason.length > 0);

    const decision = new CommitmentManager().commit(
      thought,
      evidence,
      constraints,
      judgment,
    );
    assert.equal(decision.metadata.schemaVersion, '1.0.0');
    assert.equal(decision.requestId, thought.requestId);
    assert.equal(decision.selectedAction.sourceCandidateId, 'cand-1');
    assert.ok(Array.isArray(decision.risk));
  });
});
