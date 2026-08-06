import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { WorldUnderstanding } from '../../perception/models/world-understanding.models';
import { ConfigService } from '../../configuration/config.service';
import { ContextBuilder } from './context.builder';
import { KnowledgeSynthesizer } from './knowledge.synthesizer';
import { ReasoningCore } from './reasoning.core';
import { CriticalEvaluator } from './critical.evaluator';
import { ThoughtComposer } from './thought.composer';

function sampleWorld(overrides: Partial<WorldUnderstanding> = {}): WorldUnderstanding {
  return {
    requestId: 'req-think-1',
    userId: 'u1',
    organizationId: 'o1',
    sessionId: 's1',
    actor: { kind: 'user', id: 'u1' },
    goal: 'understand:analysis_request',
    objects: [
      {
        id: 'primary-input',
        type: 'text',
        label: 'primary_input',
        attributes: { contentPreview: 'Analyze AAPL vs MSFT' },
      },
      { id: 'entity-1', type: 'entity', label: 'AAPL', attributes: { value: 'AAPL' } },
      { id: 'entity-2', type: 'entity', label: 'MSFT', attributes: { value: 'MSFT' } },
    ],
    relationships: [
      {
        id: 'rel-1',
        type: 'mentions',
        fromObjectId: 'primary-input',
        toObjectId: 'entity-1',
        attributes: {},
      },
    ],
    constraints: [
      {
        id: 'c1',
        type: 'identity',
        description: 'sample constraint',
        severity: 'info',
      },
    ],
    unknowns: [{ id: 'u1', field: 'sessionExtra', reason: 'missing' }],
    environment: { attributes: { channel: 'api' } },
    confidence: 0.82,
    safetyObservations: [],
    metadata: {
      inputType: 'text',
      language: 'en',
      intent: 'analysis_request',
      entities: ['AAPL', 'MSFT'],
      emotion: 'neutral',
      priority: 'normal',
      perceivedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      extras: {},
    },
    ...overrides,
  };
}

describe('ContextBuilder', () => {
  it('builds ThinkingContext without reasoning', () => {
    const ctx = new ContextBuilder().build(sampleWorld());
    assert.equal(ctx.requestId, 'req-think-1');
    assert.equal(ctx.goal, 'understand:analysis_request');
    assert.equal(ctx.intent, 'analysis_request');
    assert.ok(ctx.objectIds.includes('primary-input'));
    assert.throws(() => new ContextBuilder().build(null as never), /required/);
  });
});

describe('KnowledgeSynthesizer', () => {
  it('merges world + provided + conversation + system without retrieval', () => {
    const world = sampleWorld();
    const thinking = new ContextBuilder().build(world);
    const knowledge = new KnowledgeSynthesizer().synthesize(thinking, {
      world,
      providedKnowledge: [{ key: 'policy', value: 'read-only', confidence: 0.9 }],
      conversationContext: ['prior: ask about volatility'],
      systemContext: ['env:dev'],
    });
    assert.ok(knowledge.facts.some((f) => f.source === 'provided'));
    assert.ok(knowledge.facts.some((f) => f.source === 'conversation'));
    assert.ok(knowledge.facts.some((f) => f.source === 'system'));
    assert.ok(knowledge.coverageScore >= 0 && knowledge.coverageScore <= 1);
  });
});

describe('ReasoningCore + CriticalEvaluator + ThoughtComposer', () => {
  it('produces modular reasoning, evaluation, and canonical Thought', () => {
    const world = sampleWorld();
    const thinking = new ContextBuilder().build(world);
    const knowledge = new KnowledgeSynthesizer().synthesize(thinking, { world });
    const reasoning = new ReasoningCore(new ConfigService()).reason(thinking, knowledge);

    const kinds = new Set(reasoning.steps.map((s) => s.kind));
    for (const k of ['logical', 'comparative', 'causal', 'hypothesis', 'alternative', 'multi_step']) {
      assert.ok(kinds.has(k as never), `missing kind ${k}`);
    }
    assert.ok(reasoning.candidateSolutions.length >= 1);

    const evaluated = new CriticalEvaluator().evaluate(thinking, knowledge, reasoning);
    assert.ok(evaluated.scores.confidence >= 0 && evaluated.scores.confidence <= 1);
    assert.ok(evaluated.rankedCandidateIds.length >= 1);
    assert.ok(evaluated.recommendation.length > 0);

    const thought = new ThoughtComposer().compose(thinking, knowledge, evaluated);
    assert.equal(thought.metadata.schemaVersion, '1.0.0');
    assert.equal(thought.requestId, world.requestId);
    assert.ok(Array.isArray(thought.candidateSolutions));
    assert.ok(Array.isArray(thought.assumptions));
    assert.ok(Array.isArray(thought.constraints));
    assert.ok(Array.isArray(thought.risks));
  });
});
