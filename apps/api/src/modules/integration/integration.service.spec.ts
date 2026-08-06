import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { createBuiltinConnectorAdapters } from './adapters';
import { INTEGRATION_EVENTS } from './events/integration.events';
import type { IntegrationResult } from './models/integration.models';
import { ConnectionLifecycleManager } from './processors/connection.lifecycle.manager';
import { IntegrationController } from './processors/integration.controller';
import { IntegrationRegistry } from './processors/integration.registry';
import { IntegrationResolver } from './processors/integration.resolver';
import { IntegrationService } from './integration.service';

function assertResultContract(result: IntegrationResult): void {
  assert.ok(result.requestId);
  assert.ok(result.connectorId);
  assert.ok(result.traceId);
  assert.ok(
    ['completed', 'failed', 'timeout', 'auth_failed'].includes(result.status),
  );
  assert.ok(typeof result.duration === 'number');
  assert.ok(result.output && typeof result.output === 'object');
  assert.ok(result.metadata && typeof result.metadata === 'object');
}

function createService(): { service: IntegrationService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('integration.#', (e) => {
    events.push(e.topic);
  });
  bus.subscribe('connector.#', (e) => {
    events.push(e.topic);
  });

  const adapters = createBuiltinConnectorAdapters();
  const registry = new IntegrationRegistry(config);
  const resolver = new IntegrationResolver(registry);
  const lifecycle = new ConnectionLifecycleManager(config);
  const controller = new IntegrationController(
    config,
    resolver,
    lifecycle,
    adapters,
  );
  const service = new IntegrationService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
    registry,
    lifecycle,
    adapters,
  );
  service.onModuleInit();
  return { service, events };
}

describe('IntegrationService public API', () => {
  let service: IntegrationService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('execute returns IntegrationResult and emits started/completed', async () => {
    const result = await service.execute({
      connectorId: 'github',
      operation: 'list_repos',
      input: { org: 'ai-tos' },
    });
    assertResultContract(result);
    assert.equal(result.status, 'completed');
    assert.ok(events.includes(INTEGRATION_EVENTS.started));
    assert.ok(events.includes(INTEGRATION_EVENTS.completed));
    assert.ok(events.includes(INTEGRATION_EVENTS.connectorRegistered));
    assert.ok(events.includes(INTEGRATION_EVENTS.connectorConnected));
  });

  it('supports multiple connectors via unified execute', async () => {
    for (const connectorId of ['slack', 'aws', 'postgresql', 'mcp_server'] as const) {
      const result = await service.execute({
        connectorId,
        operation: 'ping',
        input: { probe: true },
      });
      assert.equal(result.connectorId, connectorId);
      assert.equal(result.status, 'completed');
    }
  });

  it('emits failed for unknown connector', async () => {
    await assert.rejects(
      () =>
        service.execute({
          connectorId: 'not_a_real_connector',
          operation: 'x',
          input: {},
        }),
      /unavailable/i,
    );
    assert.ok(events.includes(INTEGRATION_EVENTS.failed));
  });
});

describe('Integration contract', () => {
  it('keeps identical top-level IntegrationResult keys', async () => {
    const { service } = createService();
    const a = await service.execute({
      connectorId: 'rest_api',
      operation: 'get',
      input: { path: '/health' },
    });
    const b = await service.execute({
      connectorId: 'graphql_api',
      operation: 'query',
      input: { query: '{ ping }' },
    });
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
