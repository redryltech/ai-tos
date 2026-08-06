import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type {
  CapabilityImplementation,
  CapabilityRequest,
  CapabilityResult,
} from '../models/capability.models';
import type { ICapabilityProvider } from '../providers/capability.provider';
import { LocalCapabilityProvider } from '../providers/local.capability.provider';
import { createBuiltinLocalImplementations } from './builtin.capabilities';
import { CapabilityOrchestrator } from './capability.orchestrator';
import { CapabilityRegistry } from './capability.registry';
import { CapabilityResolver } from './capability.resolver';
import { CapabilityRouter } from './capability.router';

function seed(registry: CapabilityRegistry, providerId = 'local-capability-provider'): void {
  for (const impl of createBuiltinLocalImplementations(providerId)) {
    registry.register(impl);
  }
}

describe('CapabilityRegistry', () => {
  it('registers discovers and versions capabilities', () => {
    const registry = new CapabilityRegistry();
    seed(registry);
    assert.ok(registry.list('translation').length >= 1);
    assert.ok(registry.listDescriptors().some((d) => d.name === 'embeddings'));
    registry.setAvailable('local:translation', false);
    assert.equal(registry.get('local:translation')?.available, false);
    assert.equal(registry.unregister('local:translation'), true);
  });

  it('allows dynamic future capability registration', () => {
    const registry = new CapabilityRegistry();
    const custom: CapabilityImplementation = Object.freeze({
      id: 'local:custom_charting',
      capability: 'custom_charting',
      version: '1.0.0',
      tier: 'local',
      priority: 50,
      available: true,
      providerId: 'local-capability-provider',
      descriptor: Object.freeze({
        name: 'custom_charting',
        version: '1.0.0',
        lifecycle: 'active',
        supportedInputs: ['text'],
        supportedOutputs: ['structured'],
        latencyClass: 'low',
        streamingSupport: false,
        providerRequirements: [],
        metadata: {},
      }),
    });
    registry.register(custom);
    assert.equal(registry.list('custom_charting')[0]?.id, 'local:custom_charting');
  });
});

describe('CapabilityResolver + Router', () => {
  it('resolves availability and routes by preferred tier', () => {
    const config = new ConfigService();
    const registry = new CapabilityRegistry();
    seed(registry);
    registry.register(
      Object.freeze({
        id: 'cloud:translation',
        capability: 'translation',
        version: '1.0.0',
        tier: 'cloud',
        priority: 10,
        available: true,
        providerId: 'cloud-stub',
        descriptor: Object.freeze({
          name: 'translation',
          version: '1.0.0',
          lifecycle: 'active',
          supportedInputs: ['text'],
          supportedOutputs: ['text'],
          latencyClass: 'medium',
          streamingSupport: false,
          providerRequirements: [],
          metadata: {},
        }),
      }),
    );
    const resolver = new CapabilityResolver(registry);
    const resolved = resolver.resolve('translation');
    assert.equal(resolved.available, true);

    const router = new CapabilityRouter(config, resolver);
    const local = router.route('translation', 'local');
    assert.equal(local.tier, 'local');
    const cloud = router.route('translation', 'cloud');
    assert.equal(cloud.tier, 'cloud');
  });
});

describe('CapabilityOrchestrator', () => {
  let registry: CapabilityRegistry;
  let orchestrator: CapabilityOrchestrator;
  let provider: LocalCapabilityProvider;

  beforeEach(() => {
    const config = new ConfigService();
    registry = new CapabilityRegistry();
    seed(registry);
    provider = new LocalCapabilityProvider();
    const resolver = new CapabilityResolver(registry);
    const router = new CapabilityRouter(config, resolver);
    orchestrator = new CapabilityOrchestrator(config, router, provider, registry);
  });

  it('executes single capability', async () => {
    const result = await orchestrator.execute({
      requestId: 'r1',
      capability: 'text_generation',
      input: { text: 'hello capability' },
      traceId: 't1',
    });
    assert.equal(result.status, 'completed');
    assert.ok(result.output.text);
  });

  it('executes sequential pipeline', async () => {
    const result = await orchestrator.execute({
      requestId: 'r2',
      capability: 'text_generation',
      input: { text: 'hola' },
      options: { pipeline: ['translation', 'classification'] },
      traceId: 't2',
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.metadata.mode, 'sequential');
  });

  it('executes parallel pipeline', async () => {
    const result = await orchestrator.execute({
      requestId: 'r3',
      capability: 'text_generation',
      input: { text: 'parallel' },
      options: { pipeline: ['classification', 'extraction'], parallel: true },
      traceId: 't3',
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.metadata.mode, 'parallel');
  });

  it('supports cancellation', async () => {
    assert.equal(orchestrator.cancel('tok-1'), true);
    const result = await orchestrator.execute({
      requestId: 'r4',
      capability: 'reasoning',
      input: { text: 'x' },
      options: { cancelToken: 'tok-1' },
      traceId: 't4',
    });
    assert.equal(result.status, 'cancelled');
  });

  it('falls back when primary unavailable path fails', async () => {
    class FlakyProvider implements ICapabilityProvider {
      readonly providerId = 'flaky';
      readonly tier = 'local' as const;
      supports(): boolean {
        return true;
      }
      async execute(
        implementation: CapabilityImplementation,
        request: CapabilityRequest,
      ): Promise<CapabilityResult> {
        if (implementation.id === 'local:embeddings') {
          throw new Error('primary failed');
        }
        return new LocalCapabilityProvider().execute(implementation, request);
      }
    }

    registry.register(
      Object.freeze({
        id: 'local:embeddings-alt',
        capability: 'embeddings',
        version: '1.0.1',
        tier: 'local',
        priority: 1,
        available: true,
        providerId: 'flaky',
        descriptor: registry.get('local:embeddings')!.descriptor,
      }),
    );

    const config = new ConfigService();
    const resolver = new CapabilityResolver(registry);
    const router = new CapabilityRouter(config, resolver);
    const orch = new CapabilityOrchestrator(
      config,
      router,
      new FlakyProvider(),
      registry,
    );

    const result = await orch.execute({
      requestId: 'r5',
      capability: 'embeddings',
      input: { text: 'vector me' },
      constraints: { allowFallback: true },
      traceId: 't5',
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.metadata.fallbackUsed, true);
  });
});
