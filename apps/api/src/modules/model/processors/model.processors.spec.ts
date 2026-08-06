import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import { createBuiltinAdapters, createStubAdapter } from '../adapters';
import { AuthenticationManager } from './authentication.manager';
import { InferenceExecutor } from './inference.executor';
import { ProviderHealthMonitor } from './provider.health.monitor';
import { ProviderRegistry } from './provider.registry';
import { UsageCollector } from './usage.collector';

describe('ProviderRegistry', () => {
  it('registers discovers and versions providers', () => {
    const registry = new ProviderRegistry();
    const adapter = createBuiltinAdapters()[0]!;
    registry.register({
      descriptor: adapter.descriptor(),
      adapterId: adapter.adapterId,
      available: true,
    });
    assert.equal(registry.list().length, 1);
    assert.equal(registry.get('local')?.descriptor.kind, 'local');
    registry.setAvailable('local', false);
    assert.equal(registry.get('local')?.available, false);
    assert.equal(registry.unregister('local'), true);
  });

  it('allows dynamic future provider registration', () => {
    const registry = new ProviderRegistry();
    const custom = createStubAdapter({
      adapterId: 'custom-adapter',
      providerId: 'custom_vendor',
      kind: 'custom_vendor',
      displayName: 'Custom Vendor',
      models: ['custom-1'],
    });
    registry.register({
      descriptor: custom.descriptor(),
      adapterId: custom.adapterId,
      available: true,
    });
    assert.ok(registry.listDescriptors().some((d) => d.providerId === 'custom_vendor'));
  });
});

describe('AuthenticationManager', () => {
  it('stores validates refreshes credentials', () => {
    const auth = new AuthenticationManager(new ConfigService());
    auth.store({
      providerId: 'openai',
      mode: 'api_key',
      secretRef: 'secret://openai',
      expiresAt: Date.now() + 60_000,
    });
    assert.equal(auth.validate('openai'), true);
    const refreshed = auth.refresh('openai');
    assert.ok(refreshed?.secretRef.includes('refreshed'));
    assert.equal(auth.remove('openai'), true);
    assert.equal(auth.validate('openai'), false);
  });

  it('rejects expired credentials', () => {
    const auth = new AuthenticationManager(new ConfigService());
    auth.store({
      providerId: 'ollama',
      mode: 'api_key',
      secretRef: 'secret://ollama',
      expiresAt: Date.now() - 1,
    });
    assert.equal(auth.validate('ollama'), false);
  });
});

describe('InferenceExecutor + Adapters', () => {
  it('executes sync inference via adapter', async () => {
    const executor = new InferenceExecutor(new ConfigService());
    const adapter = createBuiltinAdapters().find((a) => a.providerId === 'local')!;
    const result = await executor.execute(
      {
        requestId: 'r1',
        providerId: 'local',
        modelId: 'local-default',
        input: { text: 'hello model' },
        traceId: 't1',
      },
      adapter,
    );
    assert.equal(result.status, 'completed');
    assert.ok(result.output.text);
    assert.ok(result.usage.totalTokens > 0);
  });

  it('supports stream and batch modes', async () => {
    const executor = new InferenceExecutor(new ConfigService());
    const adapter = createBuiltinAdapters().find((a) => a.providerId === 'openai')!;
    const streamed = await executor.execute(
      {
        requestId: 'r2',
        providerId: 'openai',
        modelId: 'gpt-stub',
        input: { prompt: 'stream me' },
        options: { mode: 'stream', stream: true },
        traceId: 't2',
      },
      adapter,
    );
    assert.equal(streamed.output.streamed, true);

    const batched = await executor.execute(
      {
        requestId: 'r3',
        providerId: 'openai',
        modelId: 'gpt-stub',
        input: { prompt: 'batch me' },
        options: { mode: 'batch' },
        traceId: 't3',
      },
      adapter,
    );
    assert.equal(batched.output.mode, 'batch');
  });
});

describe('ProviderHealthMonitor', () => {
  it('tracks failures recovery and latency', () => {
    const monitor = new ProviderHealthMonitor();
    monitor.recordSuccess('local', 12);
    assert.equal(monitor.get('local')?.status, 'healthy');
    monitor.recordFailure('local', 'boom', 40);
    monitor.recordFailure('local', 'boom', 40);
    monitor.recordFailure('local', 'boom', 40);
    assert.equal(monitor.get('local')?.status, 'unhealthy');
    monitor.markRecovered('local');
    assert.equal(monitor.get('local')?.status, 'healthy');
    assert.ok(monitor.list().length >= 1);
  });
});

describe('UsageCollector', () => {
  it('collects usage without billing', () => {
    const collector = new UsageCollector();
    collector.collect({
      requestId: 'u1',
      providerId: 'local',
      modelId: 'local-default',
      usage: { promptTokens: 4, completionTokens: 6, totalTokens: 10 },
      duration: 5,
      status: 'completed',
      recordedAt: Date.now(),
    });
    assert.equal(collector.list('local').length, 1);
    assert.equal(collector.totals('local').totalTokens, 10);
  });
});
