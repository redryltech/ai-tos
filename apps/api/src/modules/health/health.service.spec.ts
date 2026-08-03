import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService(new ConfigService());
  });

  it('liveness is always ok', () => {
    const live = service.getLiveness();
    assert.equal(live.status, 'ok');
    assert.ok(live.service);
    assert.ok(live.timestamp);
  });

  it('health includes api and configured component slots', async () => {
    const health = await service.getHealth();
    assert.ok(['ok', 'degraded', 'error'].includes(health.status));
    assert.ok(health.details);
    const components = (health.details as { components: Array<{ name: string }> }).components;
    const names = components.map((c) => c.name);
    assert.ok(names.includes('api'));
    assert.ok(names.includes('database'));
    assert.ok(names.includes('redis'));
    assert.ok(names.includes('cache'));
    assert.ok(names.includes('ai_gateway'));
    assert.ok(names.includes('event_bus'));
  });

  it('readiness exposes ready flag and required components', async () => {
    const ready = await service.getReadiness();
    assert.equal(typeof ready.ready, 'boolean');
    assert.ok(Array.isArray(ready.components));
    assert.ok(ready.components.some((c) => c.name === 'api' && c.status === 'ok'));
  });

  it('skips event_bus when check is disabled by ConfigService', async () => {
    const probe = await service.runChecks();
    const bus = probe.components.find((c) => c.name === 'event_bus');
    assert.ok(bus);
    assert.equal(bus.status, 'skipped');
  });
});
