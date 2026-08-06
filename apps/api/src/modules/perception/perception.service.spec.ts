import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { PerceptionService } from './perception.service';
import { InputGateway } from './processors/input.gateway';
import { OutputStandardizer } from './processors/output.standardizer';
import { PerceptionProcessor } from './processors/perception.processor';
import { UnderstandingProcessor } from './processors/understanding.processor';
import { WorldModelBuilder } from './processors/world-model.builder';
import { PERCEPTION_EVENTS } from './events/perception.events';
import type { WorldUnderstanding } from './models/world-understanding.models';

function createService(): {
  service: PerceptionService;
  events: string[];
  bus: EventBusService;
} {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('perception.#', (e) => {
    events.push(e.topic);
  });

  const service = new PerceptionService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    new InputGateway(),
    new PerceptionProcessor(config),
    new UnderstandingProcessor(),
    new WorldModelBuilder(),
    new OutputStandardizer(),
  );

  return { service, events, bus };
}

function assertCanonicalContract(world: WorldUnderstanding): void {
  const keys = Object.keys(world).sort();
  assert.deepEqual(keys, [
    'actor',
    'confidence',
    'constraints',
    'environment',
    'goal',
    'metadata',
    'objects',
    'organizationId',
    'relationships',
    'requestId',
    'safetyObservations',
    'sessionId',
    'unknowns',
    'userId',
  ]);
  assert.equal(world.metadata.schemaVersion, '1.0.0');
}

describe('PerceptionService public API', () => {
  let service: PerceptionService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('perceive returns WorldUnderstanding and emits started/completed', async () => {
    const world = await service.perceive({
      content: 'Analyze AAPL volatility',
      userId: 'u1',
      organizationId: 'org1',
      sessionId: 'sess1',
    });

    assertCanonicalContract(world);
    assert.equal(world.metadata.intent, 'analysis_request');
    assert.ok(events.includes(PERCEPTION_EVENTS.started));
    assert.ok(events.includes(PERCEPTION_EVENTS.completed));
  });

  it('supports all declared input types', async () => {
    const cases = [
      { type: 'text' as const, content: 'hello' },
      { type: 'image' as const, contentBinaryRef: 'blob://1', mimeType: 'image/png' },
      { type: 'audio' as const, contentBinaryRef: 'blob://2', mimeType: 'audio/wav' },
      { type: 'video' as const, contentBinaryRef: 'blob://3', mimeType: 'video/mp4' },
      { type: 'pdf' as const, contentBinaryRef: 'blob://4', mimeType: 'application/pdf' },
      { type: 'website' as const, uri: 'https://example.com' },
      { type: 'json' as const, data: { k: 1 } },
      { type: 'api_request' as const, data: { method: 'GET' } },
      { type: 'event' as const, data: { name: 'tick' } },
    ];

    for (const c of cases) {
      const world = await service.perceive(c);
      assert.equal(world.metadata.inputType, c.type);
      assertCanonicalContract(world);
    }
  });

  it('emits failed and rethrows on invalid input', async () => {
    await assert.rejects(() => service.perceive({ type: 'text' }), /requires content/);
    assert.ok(events.includes(PERCEPTION_EVENTS.failed));
  });
});

describe('Perception pipeline contract', () => {
  it('keeps identical top-level structure across diverse inputs', async () => {
    const { service } = createService();
    const a = await service.perceive({ content: 'help me' });
    const b = await service.perceive({ type: 'event', data: { x: true } });
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    assert.deepEqual(Object.keys(a.metadata).sort(), Object.keys(b.metadata).sort());
  });
});
