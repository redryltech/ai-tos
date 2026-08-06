import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import {
  createBuiltinConnectorAdapters,
  createStubConnectorAdapter,
} from '../adapters';
import { ConnectionLifecycleManager } from './connection.lifecycle.manager';
import { IntegrationRegistry } from './integration.registry';
import { IntegrationResolver } from './integration.resolver';

describe('IntegrationRegistry', () => {
  it('registers discovers and versions connectors', () => {
    const registry = new IntegrationRegistry(new ConfigService());
    const adapter = createBuiltinConnectorAdapters().find(
      (a) => a.connectorId === 'github',
    )!;
    registry.register({
      descriptor: adapter.descriptor(),
      adapterId: adapter.adapterId,
      available: true,
    });
    assert.equal(registry.list().length, 1);
    assert.equal(registry.get('github')?.descriptor.version, '1.0.0');
    registry.setAvailable('github', false);
    assert.equal(registry.get('github')?.available, false);
    assert.equal(registry.unregister('github'), true);
  });

  it('allows dynamic future connector registration', () => {
    const registry = new IntegrationRegistry(new ConfigService());
    const custom = createStubConnectorAdapter({
      connectorId: 'custom_erp',
      name: 'Custom ERP',
    });
    registry.register({
      descriptor: custom.descriptor(),
      adapterId: custom.adapterId,
      available: true,
    });
    assert.ok(
      registry.listDescriptors().some((d) => d.connectorId === 'custom_erp'),
    );
  });
});

describe('IntegrationResolver', () => {
  it('validates availability and operation', () => {
    const config = new ConfigService();
    const registry = new IntegrationRegistry(config);
    const adapter = createBuiltinConnectorAdapters().find(
      (a) => a.connectorId === 'slack',
    )!;
    registry.register({
      descriptor: adapter.descriptor(),
      adapterId: adapter.adapterId,
      available: true,
    });
    const resolver = new IntegrationResolver(registry);
    assert.equal(resolver.resolve('slack', 'post_message').available, true);
    assert.equal(resolver.resolve('missing', 'x').available, false);
    assert.equal(resolver.resolve('slack', '').reason, 'operation_required');
  });
});

describe('ConnectionLifecycleManager', () => {
  it('authenticates connects refreshes and disconnects', () => {
    const lifecycle = new ConnectionLifecycleManager(new ConfigService());
    const failed = lifecycle.authenticate('aws');
    assert.equal(failed.state, 'error');

    const auth = lifecycle.authenticate('aws', 'api_key', 'secret://aws');
    assert.equal(auth.state, 'authenticating');
    const connected = lifecycle.connect('aws');
    assert.equal(connected.state, 'connected');
    assert.ok(typeof connected.poolSlot === 'number');

    const refreshed = lifecycle.refresh('aws');
    assert.equal(refreshed.state, 'connected');
    assert.ok(refreshed.credentialRef?.includes('refreshed'));

    const disconnected = lifecycle.disconnect('aws');
    assert.equal(disconnected.state, 'disconnected');
  });

  it('recovers failed sessions', () => {
    const lifecycle = new ConnectionLifecycleManager(new ConfigService());
    lifecycle.authenticate('azure');
    const recovered = lifecycle.recover('azure');
    assert.equal(recovered.state, 'connected');
  });
});

describe('Connector Adapters', () => {
  it('executes stub operations without vendor SDKs', async () => {
    const adapter = createBuiltinConnectorAdapters().find(
      (a) => a.connectorId === 'salesforce',
    )!;
    const result = await adapter.execute({
      requestId: 'r1',
      connectorId: 'salesforce',
      operation: 'query',
      input: { soql: 'SELECT Id FROM Account' },
      traceId: 't1',
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.output.stub, true);
    assert.equal(result.output.operation, 'query');
  });
});
