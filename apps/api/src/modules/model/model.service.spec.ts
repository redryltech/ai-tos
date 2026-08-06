import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { createBuiltinAdapters } from './adapters';
import { MODEL_EVENTS } from './events/model.events';
import type { ModelResponse } from './models/model.models';
import { ModelService } from './model.service';
import { AuthenticationManager } from './processors/authentication.manager';
import { InferenceExecutor } from './processors/inference.executor';
import { ModelController } from './processors/model.controller';
import { ProviderHealthMonitor } from './processors/provider.health.monitor';
import { ProviderRegistry } from './processors/provider.registry';
import { UsageCollector } from './processors/usage.collector';

function assertResponseContract(result: ModelResponse): void {
  assert.ok(result.requestId);
  assert.ok(result.providerId);
  assert.ok(result.modelId);
  assert.ok(result.traceId);
  assert.ok(['completed', 'failed', 'timeout', 'cancelled'].includes(result.status));
  assert.ok(typeof result.duration === 'number');
  assert.ok(result.output && typeof result.output === 'object');
  assert.ok(result.metadata && typeof result.metadata === 'object');
  assert.ok(typeof result.usage.totalTokens === 'number');
}

function createService(): { service: ModelService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('model.#', (e) => {
    events.push(e.topic);
  });
  bus.subscribe('provider.#', (e) => {
    events.push(e.topic);
  });

  const adapters = createBuiltinAdapters();
  const registry = new ProviderRegistry();
  const auth = new AuthenticationManager(config);
  const healthMonitor = new ProviderHealthMonitor();
  const usage = new UsageCollector();
  const executor = new InferenceExecutor(config);
  const controller = new ModelController(
    config,
    registry,
    auth,
    executor,
    healthMonitor,
    usage,
    adapters,
  );

  const service = new ModelService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
    registry,
    auth,
    healthMonitor,
    adapters,
  );
  service.onModuleInit();
  return { service, events };
}

describe('ModelService public API', () => {
  let service: ModelService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('infer returns ModelResponse and emits started/completed', async () => {
    const result = await service.infer({
      modelId: 'local-default',
      input: { text: 'infer hello' },
    });
    assertResponseContract(result);
    assert.equal(result.status, 'completed');
    assert.ok(events.includes(MODEL_EVENTS.inferenceStarted));
    assert.ok(events.includes(MODEL_EVENTS.inferenceCompleted));
    assert.ok(events.includes(MODEL_EVENTS.providerRegistered));
  });

  it('supports multiple providers via unified infer', async () => {
    for (const providerId of ['local', 'openai', 'anthropic', 'gemini'] as const) {
      const modelId =
        providerId === 'local'
          ? 'local-default'
          : providerId === 'openai'
            ? 'gpt-stub'
            : providerId === 'anthropic'
              ? 'claude-stub'
              : 'gemini-stub';
      const result = await service.infer({
        providerId,
        modelId,
        input: { text: `via ${providerId}` },
      });
      assert.equal(result.providerId, providerId);
      assert.equal(result.status, 'completed');
    }
  });

  it('emits failed for unknown provider', async () => {
    await assert.rejects(
      () =>
        service.infer({
          providerId: 'does-not-exist',
          modelId: 'x',
          input: { text: 'x' },
        }),
      /unavailable/i,
    );
    assert.ok(events.includes(MODEL_EVENTS.inferenceFailed));
  });
});

describe('Model contract', () => {
  it('keeps identical top-level ModelResponse keys', async () => {
    const { service } = createService();
    const a = await service.infer({
      providerId: 'ollama',
      modelId: 'ollama-stub',
      input: { text: 'a' },
    });
    const b = await service.infer({
      providerId: 'vllm',
      modelId: 'vllm-stub',
      input: { text: 'b' },
    });
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
