import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { CapabilityService } from './capability.service';
import { CAPABILITY_EVENTS } from './events/capability.events';
import type { CapabilityResult } from './models/capability.models';
import { createBuiltinLocalImplementations } from './processors/builtin.capabilities';
import { CapabilityController } from './processors/capability.controller';
import { CapabilityOrchestrator } from './processors/capability.orchestrator';
import { CapabilityRegistry } from './processors/capability.registry';
import { CapabilityResolver } from './processors/capability.resolver';
import { CapabilityRouter } from './processors/capability.router';
import { LocalCapabilityProvider } from './providers/local.capability.provider';

function assertResultContract(result: CapabilityResult): void {
  assert.ok(result.requestId);
  assert.ok(result.capability);
  assert.ok(result.traceId);
  assert.ok(['completed', 'failed', 'cancelled', 'timeout'].includes(result.status));
  assert.ok(typeof result.duration === 'number');
  assert.ok(result.output && typeof result.output === 'object');
  assert.ok(result.metadata && typeof result.metadata === 'object');
}

function createService(): { service: CapabilityService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('capability.#', (e) => {
    events.push(e.topic);
  });

  const provider = new LocalCapabilityProvider();
  const registry = new CapabilityRegistry();
  for (const impl of createBuiltinLocalImplementations(provider.providerId)) {
    registry.register(impl);
  }
  const resolver = new CapabilityResolver(registry);
  const router = new CapabilityRouter(config, resolver);
  const orchestrator = new CapabilityOrchestrator(config, router, provider, registry);
  const controller = new CapabilityController(orchestrator);

  const service = new CapabilityService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
    registry,
    provider,
  );
  // builtins already seeded above; onModuleInit would re-register safely
  return { service, events };
}

describe('CapabilityService public API', () => {
  let service: CapabilityService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('execute returns CapabilityResult and emits started/completed', async () => {
    const result = await service.execute({
      capability: 'translation',
      input: { text: 'bonjour', targetLanguage: 'en' },
    });
    assertResultContract(result);
    assert.equal(result.status, 'completed');
    assert.ok(events.includes(CAPABILITY_EVENTS.started));
    assert.ok(events.includes(CAPABILITY_EVENTS.completed));
  });

  it('supports all builtin capability names via unified execute', async () => {
    const names = [
      'reasoning',
      'text_generation',
      'embeddings',
      'moderation',
      'code_generation',
      'function_calling',
    ] as const;
    for (const capability of names) {
      const result = await service.execute({
        capability,
        input: { text: `sample for ${capability}` },
      });
      assert.equal(result.capability, capability);
      assert.equal(result.status, 'completed');
    }
  });

  it('emits failed for unknown capability', async () => {
    const result = await service.execute({
      capability: 'not_registered_capability_xyz',
      input: { text: 'x' },
    });
    assert.equal(result.status, 'failed');
    assert.ok(events.includes(CAPABILITY_EVENTS.failed));
  });
});

describe('Capability contract pipeline', () => {
  it('keeps identical top-level CapabilityResult keys', async () => {
    const { service } = createService();
    const a = await service.execute({
      capability: 'classification',
      input: { text: 'short' },
    });
    const b = await service.execute({
      capability: 'extraction',
      input: { text: 'Alpha Beta Gamma' },
    });
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
