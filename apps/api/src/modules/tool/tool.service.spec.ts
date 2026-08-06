import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { createBuiltinToolAdapters } from './adapters';
import { TOOL_EVENTS } from './events/tool.events';
import type { ToolResult } from './models/tool.models';
import { ToolController } from './processors/tool.controller';
import { ToolExecutor } from './processors/tool.executor';
import { ToolRegistry } from './processors/tool.registry';
import { ToolResolver } from './processors/tool.resolver';
import { ToolService } from './tool.service';

function assertResultContract(result: ToolResult): void {
  assert.ok(result.requestId);
  assert.ok(result.toolId);
  assert.ok(result.traceId);
  assert.ok(['completed', 'failed', 'timeout', 'cancelled'].includes(result.status));
  assert.ok(typeof result.duration === 'number');
  assert.ok(result.output && typeof result.output === 'object');
  assert.ok(result.metadata && typeof result.metadata === 'object');
}

function createService(): {
  service: ToolService;
  events: string[];
  executor: ToolExecutor;
} {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('tool.#', (e) => {
    events.push(e.topic);
  });

  const adapters = createBuiltinToolAdapters();
  const registry = new ToolRegistry(config);
  const resolver = new ToolResolver(config, registry);
  const executor = new ToolExecutor(config);
  const controller = new ToolController(resolver, executor, adapters);
  const service = new ToolService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
    registry,
    adapters,
  );
  service.onModuleInit();
  return { service, events, executor };
}

describe('ToolService public API', () => {
  let service: ToolService;
  let events: string[];
  let executor: ToolExecutor;

  beforeEach(() => {
    ({ service, events, executor } = createService());
  });

  it('execute returns ToolResult and emits started/completed', async () => {
    const result = await service.execute({
      toolId: 'json_processor',
      input: { json: '{"hello":"world"}' },
    });
    assertResultContract(result);
    assert.equal(result.status, 'completed');
    assert.ok(events.includes(TOOL_EVENTS.started));
    assert.ok(events.includes(TOOL_EVENTS.completed));
    assert.ok(events.includes(TOOL_EVENTS.registered));
  });

  it('supports multiple tools via unified execute', async () => {
    const ids = ['calculator', 'csv_processor', 'encoding', 'http_client'] as const;
    for (const toolId of ids) {
      const input =
        toolId === 'calculator'
          ? { a: 4, b: 2, op: '*' }
          : toolId === 'csv_processor'
            ? { csv: 'a,b\n1,2' }
            : toolId === 'encoding'
              ? { text: 'ai-tos', action: 'base64_encode' }
              : { url: 'https://example.invalid', method: 'GET' };
      const result = await service.execute({ toolId, input });
      assert.equal(result.toolId, toolId);
      assert.equal(result.status, 'completed');
    }
  });

  it('emits failed for unknown tool', async () => {
    await assert.rejects(
      () =>
        service.execute({
          toolId: 'not_a_real_tool',
          input: { x: 1 },
        }),
      /unavailable/i,
    );
    assert.ok(events.includes(TOOL_EVENTS.failed));
  });

  it('emits cancelled when cancel token set', async () => {
    executor.cancel('cancel-me');
    const result = await service.execute({
      toolId: 'calculator',
      input: { expression: '1 + 1' },
      options: { cancelToken: 'cancel-me' },
    });
    assert.equal(result.status, 'cancelled');
    assert.ok(events.includes(TOOL_EVENTS.cancelled));
  });
});

describe('Tool contract pipeline', () => {
  it('keeps identical top-level ToolResult keys', async () => {
    const { service } = createService();
    const a = await service.execute({
      toolId: 'compression',
      input: { text: 'hello' },
    });
    const b = await service.execute({
      toolId: 'xml_processor',
      input: { xml: '<root><a/></root>' },
    });
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
