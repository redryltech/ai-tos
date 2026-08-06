import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { MEMORY_EVENTS } from './events/memory.events';
import { MemoryService } from './memory.service';
import type { MemoryRecord } from './models/memory.models';
import { EpisodicMemory } from './processors/episodic.memory';
import { LongTermMemory } from './processors/long-term.memory';
import { MemoryController } from './processors/memory.controller';
import { MemoryEvaluator } from './processors/memory.evaluator';
import { SessionMemory } from './processors/session.memory';
import { InMemoryMemoryProvider } from './providers/in-memory.memory.provider';

function assertMemoryContract(record: MemoryRecord): void {
  assert.equal(record.schemaVersion, '1.0.0');
  assert.ok(record.id);
  assert.ok(record.content);
  assert.ok(['session', 'long_term', 'episodic'].includes(record.kind));
  assert.ok(['active', 'archived', 'forgotten'].includes(record.status));
  assert.ok(Array.isArray(record.tags));
  assert.ok(record.createdAt);
  assert.ok(record.updatedAt);
}

function createService(): { service: MemoryService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('memory.#', (e) => {
    events.push(e.topic);
  });

  const provider = new InMemoryMemoryProvider(config.memory.maxEntries);
  const controller = new MemoryController(
    new MemoryEvaluator(config),
    new SessionMemory(provider),
    new LongTermMemory(provider),
    new EpisodicMemory(provider),
    provider,
  );

  const service = new MemoryService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('MemoryService public API', () => {
  let service: MemoryService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('remember/recall/update/search/archive/forget with events', async () => {
    const remembered = await service.remember({
      content: 'User always prefers Python',
      userId: 'u1',
      organizationId: 'o1',
    });
    assertMemoryContract(remembered);
    assert.equal(remembered.kind, 'long_term');
    assert.ok(events.includes(MEMORY_EVENTS.remembered));

    const recalled = await service.recall({ userId: 'u1', kind: 'long_term' });
    assert.ok(recalled.items.some((i) => i.id === remembered.id));

    const updated = await service.update({
      id: remembered.id,
      tags: ['lang'],
    });
    assert.ok(updated.tags.includes('lang'));
    assert.ok(events.includes(MEMORY_EVENTS.updated));

    const searched = await service.search({ text: 'Python', userId: 'u1' });
    assert.ok(searched.total >= 1);

    await service.archive(remembered.id);
    assert.ok(events.includes(MEMORY_EVENTS.archived));

    await service.forget(remembered.id);
    assert.ok(events.includes(MEMORY_EVENTS.forgotten));
  });

  it('emits failed when greeting is discarded', async () => {
    await assert.rejects(() => service.remember({ content: 'Hello' }), /discarded/i);
    assert.ok(events.includes(MEMORY_EVENTS.failed));
  });
});

describe('Memory contract pipeline', () => {
  it('keeps schemaVersion across kinds', async () => {
    const { service } = createService();
    const a = await service.remember({
      content: 'Session note about current chart filters',
      sessionId: 's1',
    });
    const b = await service.remember({
      content: 'Completed task export successfully',
    });
    assert.equal(a.schemaVersion, b.schemaVersion);
    assert.deepEqual(
      ['content', 'id', 'kind', 'schemaVersion', 'status'].every((k) => k in a && k in b),
      true,
    );
  });
});
