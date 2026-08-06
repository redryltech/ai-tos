import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { POLICY_EVENTS } from './events/policy.events';
import type { EffectivePolicy } from './models/policy.models';
import { PolicyService } from './policy.service';
import { EffectivePolicyBuilder } from './processors/effective.policy.builder';
import { PolicyComposer } from './processors/policy.composer';
import { PolicyConflictResolver } from './processors/policy.conflict.resolver';
import { PolicyController } from './processors/policy.controller';
import { PolicyRegistry } from './processors/policy.registry';
import { PolicyResolver } from './processors/policy.resolver';
import { MemoryPolicyProvider } from './providers/memory.policy.provider';

function assertContract(result: EffectivePolicy): void {
  assert.ok(result.requestId);
  assert.ok(result.traceId);
  assert.ok(result.version);
  assert.ok(Array.isArray(result.rules));
  assert.ok(result.constraints && typeof result.constraints === 'object');
  assert.ok(Array.isArray(result.permissions));
  assert.ok(Array.isArray(result.obligations));
  assert.ok(result.metadata && typeof result.metadata === 'object');
  assert.ok(result.scope && typeof result.scope === 'object');
}

function createService(): { service: PolicyService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('policy.#', (e) => {
    events.push(e.topic);
  });

  const provider = new MemoryPolicyProvider();
  const registry = new PolicyRegistry(config, provider);
  const composer = new PolicyComposer(registry);
  const resolver = new PolicyResolver();
  const conflicts = new PolicyConflictResolver(config);
  const builder = new EffectivePolicyBuilder();
  const controller = new PolicyController(
    composer,
    resolver,
    conflicts,
    builder,
  );
  const service = new PolicyService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
    registry,
  );
  service.onModuleInit();
  return { service, events };
}

describe('PolicyService public API', () => {
  let service: PolicyService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('resolve returns EffectivePolicy and emits started/completed', async () => {
    const result = await service.resolve({
      resource: 'knowledge',
      scope: { organization: 'org-1', project: 'proj-1', session: 'sess-1' },
      subject: { userId: 'u1' },
    });
    assertContract(result);
    assert.ok(events.includes(POLICY_EVENTS.resolutionStarted));
    assert.ok(events.includes(POLICY_EVENTS.resolutionCompleted));
    assert.ok(events.includes(POLICY_EVENTS.registered));
  });

  it('applies most restrictive write rule for knowledge', async () => {
    const result = await service.resolve({
      resource: 'knowledge',
      scope: { organization: 'org-1', project: 'proj-1' },
    });
    const write = result.rules.find(
      (r) => r.action === 'write' && r.resource === 'knowledge',
    );
    assert.equal(write?.effect, 'deny');
    assert.ok(!result.permissions.includes('write:knowledge'));
  });

  it('emits failed for invalid request', async () => {
    await assert.rejects(
      () =>
        service.resolve({
          resource: '',
        }),
      /resource/i,
    );
    assert.ok(events.includes(POLICY_EVENTS.resolutionFailed));
  });
});

describe('Policy contract', () => {
  it('keeps identical top-level EffectivePolicy keys', async () => {
    const { service } = createService();
    const a = await service.resolve({ resource: 'model' });
    const b = await service.resolve({
      resource: 'decision',
      scope: { project: 'proj-1' },
    });
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
