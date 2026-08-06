import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import { createBuiltinToolAdapters, createStubToolAdapter } from '../adapters';
import { ToolExecutor } from './tool.executor';
import { ToolRegistry } from './tool.registry';
import { ToolResolver } from './tool.resolver';

describe('ToolRegistry', () => {
  it('registers discovers and versions tools', () => {
    const registry = new ToolRegistry(new ConfigService());
    const adapter = createBuiltinToolAdapters().find((a) => a.toolId === 'calculator')!;
    registry.register({
      descriptor: adapter.descriptor(),
      adapterId: adapter.adapterId,
      available: true,
    });
    assert.equal(registry.list().length, 1);
    assert.equal(registry.get('calculator')?.descriptor.version, '1.0.0');
    registry.setAvailable('calculator', false);
    assert.equal(registry.get('calculator')?.available, false);
    assert.equal(registry.unregister('calculator'), true);
  });

  it('allows dynamic future tool registration', () => {
    const registry = new ToolRegistry(new ConfigService());
    const custom = createStubToolAdapter({
      toolId: 'custom_hash',
      name: 'Custom Hash',
      run: (r) => ({ hash: String(r.input.text ?? '').length }),
    });
    registry.register({
      descriptor: custom.descriptor(),
      adapterId: custom.adapterId,
      available: true,
    });
    assert.ok(registry.listDescriptors().some((d) => d.toolId === 'custom_hash'));
  });
});

describe('ToolResolver', () => {
  it('validates availability and shell policy', () => {
    const config = new ConfigService();
    const registry = new ToolRegistry(config);
    for (const adapter of createBuiltinToolAdapters()) {
      registry.register({
        descriptor: adapter.descriptor(),
        adapterId: adapter.adapterId,
        available: true,
      });
    }
    const resolver = new ToolResolver(config, registry);
    assert.equal(resolver.resolve('calculator', { a: 1, b: 2 }).available, true);
    assert.equal(resolver.resolve('missing', { x: 1 }).available, false);
    assert.equal(resolver.resolve('shell', { command: 'echo' }).reason, 'shell_disabled_by_policy');
  });
});

describe('ToolExecutor + Adapters', () => {
  it('executes calculator deterministically', async () => {
    const executor = new ToolExecutor(new ConfigService());
    const adapter = createBuiltinToolAdapters().find((a) => a.toolId === 'calculator')!;
    const result = await executor.execute(
      {
        requestId: 'r1',
        toolId: 'calculator',
        input: { expression: '2 + 3' },
        traceId: 't1',
      },
      adapter,
    );
    assert.equal(result.status, 'completed');
    assert.equal(result.output.result, 5);
  });

  it('supports cancellation', async () => {
    const executor = new ToolExecutor(new ConfigService());
    const adapter = createBuiltinToolAdapters().find((a) => a.toolId === 'json_processor')!;
    assert.equal(executor.cancel('tok-1'), true);
    const result = await executor.execute(
      {
        requestId: 'r2',
        toolId: 'json_processor',
        input: { json: '{"a":1}' },
        options: { cancelToken: 'tok-1' },
        traceId: 't2',
      },
      adapter,
    );
    assert.equal(result.status, 'cancelled');
  });

  it('supports timeout', async () => {
    const executor = new ToolExecutor(new ConfigService());
    const delayed = {
      adapterId: 'slow-adapter',
      toolId: 'slow_tool',
      supports: (id: string) => id === 'slow_tool',
      descriptor: () =>
        Object.freeze({
          toolId: 'slow_tool',
          name: 'Slow Tool',
          version: '1.0.0',
          lifecycle: 'active' as const,
          inputTypes: Object.freeze(['object']),
          outputTypes: Object.freeze(['object']),
          executionMode: 'sync' as const,
          timeoutMs: 5,
          capabilities: Object.freeze(['deterministic']),
          streamingSupport: false,
          metadata: Object.freeze({ stub: true }),
        }),
      async execute(request: {
        requestId: string;
        toolId: string;
        input: Readonly<Record<string, unknown>>;
        traceId: string;
      }) {
        await new Promise((r) => setTimeout(r, 40));
        return Object.freeze({
          requestId: request.requestId,
          toolId: request.toolId,
          status: 'completed' as const,
          output: Object.freeze({ ok: true }),
          metadata: Object.freeze({}),
          duration: 40,
          traceId: request.traceId,
        });
      },
    };
    const result = await executor.execute(
      {
        requestId: 'r3',
        toolId: 'slow_tool',
        input: {},
        constraints: { timeoutMs: 5 },
        traceId: 't3',
      },
      delayed,
    );
    assert.equal(result.status, 'timeout');
  });
});
