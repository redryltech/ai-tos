import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { WorldUnderstanding } from '../perception/models/world-understanding.models';
import { THINKING_EVENTS } from './events/thinking.events';
import type { Thought } from './models/thought.models';
import { ContextBuilder } from './processors/context.builder';
import { CriticalEvaluator } from './processors/critical.evaluator';
import { KnowledgeSynthesizer } from './processors/knowledge.synthesizer';
import { ReasoningCore } from './processors/reasoning.core';
import { ThoughtComposer } from './processors/thought.composer';
import { ThinkingService } from './thinking.service';

function sampleWorld(overrides: Partial<WorldUnderstanding> = {}): WorldUnderstanding {
  return {
    requestId: 'req-api-1',
    userId: 'u1',
    organizationId: 'org1',
    sessionId: 'sess1',
    actor: { kind: 'user', id: 'u1' },
    goal: 'understand:analysis_request',
    objects: [
      {
        id: 'primary-input',
        type: 'text',
        label: 'primary_input',
        attributes: { contentPreview: 'Analyze AAPL' },
      },
    ],
    relationships: [],
    constraints: [],
    unknowns: [],
    environment: { attributes: {} },
    confidence: 0.75,
    safetyObservations: [],
    metadata: {
      inputType: 'text',
      language: 'en',
      intent: 'analysis_request',
      entities: ['AAPL'],
      emotion: 'neutral',
      priority: 'normal',
      perceivedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      extras: {},
    },
    ...overrides,
  };
}

function assertThoughtContract(thought: Thought): void {
  const keys = Object.keys(thought).sort();
  assert.deepEqual(keys, [
    'assumptions',
    'candidateSolutions',
    'confidence',
    'constraints',
    'goal',
    'knowledgeContext',
    'metadata',
    'organizationId',
    'reasoning',
    'recommendation',
    'requestId',
    'risks',
    'thinkingContext',
    'userId',
  ]);
  assert.equal(thought.metadata.schemaVersion, '1.0.0');
  assert.ok(thought.reasoning.steps.length > 0);
  assert.ok(thought.candidateSolutions.length > 0);
  assert.ok(typeof thought.recommendation === 'string');
}

function createService(): { service: ThinkingService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('thinking.#', (e) => {
    events.push(e.topic);
  });

  const service = new ThinkingService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    new ContextBuilder(),
    new KnowledgeSynthesizer(),
    new ReasoningCore(config),
    new CriticalEvaluator(),
    new ThoughtComposer(),
  );
  return { service, events };
}

describe('ThinkingService public API', () => {
  let service: ThinkingService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('think returns Thought and emits started/completed', async () => {
    const thought = await service.think(sampleWorld());
    assertThoughtContract(thought);
    assert.equal(thought.requestId, 'req-api-1');
    assert.ok(events.includes(THINKING_EVENTS.started));
    assert.ok(events.includes(THINKING_EVENTS.completed));
  });

  it('accepts ThinkInputDto with provided knowledge', async () => {
    const thought = await service.think({
      world: sampleWorld(),
      providedKnowledge: [{ key: 'sector', value: 'tech' }],
      conversationContext: ['user asked about AAPL'],
    });
    assertThoughtContract(thought);
    assert.ok(thought.knowledgeContext.facts.some((f) => f.source === 'provided'));
  });

  it('emits failed and rethrows on invalid world', async () => {
    await assert.rejects(
      () => service.think({ requestId: '' } as never),
      /required|goal/i,
    );
    assert.ok(events.includes(THINKING_EVENTS.failed));
  });
});

describe('Thinking pipeline contract', () => {
  it('keeps identical top-level Thought structure across inputs', async () => {
    const { service } = createService();
    const a = await service.think(sampleWorld({ goal: 'understand:a' }));
    const b = await service.think(
      sampleWorld({
        requestId: 'req-2',
        goal: 'understand:b',
        confidence: 0.4,
        unknowns: [{ id: 'x', field: 'organizationId', reason: 'missing' }],
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    assert.deepEqual(Object.keys(a.metadata).sort(), Object.keys(b.metadata).sort());
  });
});
