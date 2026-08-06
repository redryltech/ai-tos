import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { KNOWLEDGE_EVENTS } from './events/knowledge.events';
import { KnowledgeService } from './knowledge.service';
import type { KnowledgeDocument } from './models/knowledge.models';
import { DocumentLoader } from './processors/document.loader';
import { KnowledgeController } from './processors/knowledge.controller';
import { KnowledgeIndexManager } from './processors/knowledge.index-manager';
import { KnowledgeParser } from './processors/knowledge.parser';
import { KnowledgeStore } from './processors/knowledge.store';
import { RetrievalEngine } from './processors/retrieval.engine';
import { InMemoryKnowledgeProvider } from './providers/in-memory.knowledge.provider';
import { NoopEmbeddingCapabilityPort } from './providers/noop-embedding.port';

function assertDocContract(doc: KnowledgeDocument): void {
  assert.equal(doc.schemaVersion, '1.0.0');
  assert.ok(doc.id);
  assert.ok(doc.title);
  assert.ok(typeof doc.content === 'string');
  assert.ok(Array.isArray(doc.chunkIds));
  assert.ok(Array.isArray(doc.tags));
}

function createService(): { service: KnowledgeService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('knowledge.#', (e) => {
    events.push(e.topic);
  });

  const provider = new InMemoryKnowledgeProvider(config.knowledge.maxDocuments);
  const controller = new KnowledgeController(
    new DocumentLoader(),
    new KnowledgeParser(),
    new KnowledgeIndexManager(config, new NoopEmbeddingCapabilityPort()),
    new KnowledgeStore(provider),
    new RetrievalEngine(config, provider),
  );

  const service = new KnowledgeService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('KnowledgeService public API', () => {
  let service: KnowledgeService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('ingest/retrieve/search/update/list/delete with events', async () => {
    const ingested = await service.ingest({
      title: 'Trading FAQ',
      content: 'Risk limits and position sizing for equity portfolios',
      tags: ['risk'],
      organizationId: 'org1',
    });
    assert.equal(ingested.total, 1);
    assertDocContract(ingested.items[0]!);
    assert.ok(events.includes(KNOWLEDGE_EVENTS.ingested));

    const retrieved = await service.retrieve({
      text: 'risk limits',
      mode: 'hybrid',
      organizationId: 'org1',
    });
    assert.ok(retrieved.total >= 1);
    assert.ok(events.includes(KNOWLEDGE_EVENTS.retrieved));

    const searched = await service.search({
      text: 'position sizing',
      mode: 'keyword',
    });
    assert.ok(searched.total >= 1);
    assert.ok(events.includes(KNOWLEDGE_EVENTS.searchCompleted));

    const updated = await service.update({
      id: ingested.items[0]!.id,
      title: 'Trading FAQ v2',
    });
    assert.equal(updated.title, 'Trading FAQ v2');
    assert.ok(events.includes(KNOWLEDGE_EVENTS.updated));

    const listed = await service.list();
    assert.ok(listed.items.some((d) => d.id === updated.id));

    await service.delete(updated.id);
    assert.ok(events.includes(KNOWLEDGE_EVENTS.deleted));
    const after = await service.list();
    assert.equal(after.items.some((d) => d.id === updated.id), false);
  });

  it('emits failed on invalid ingest', async () => {
    await assert.rejects(() => service.ingest({}), /content or sourceUri/i);
    assert.ok(events.includes(KNOWLEDGE_EVENTS.failed));
  });
});

describe('Knowledge contract pipeline', () => {
  it('keeps schemaVersion across ingest and update', async () => {
    const { service } = createService();
    const a = await service.ingest({ content: 'Document A about alpha' });
    const b = await service.update({
      id: a.items[0]!.id,
      content: 'Document A about alpha revised',
    });
    assert.equal(a.items[0]!.schemaVersion, b.schemaVersion);
  });
});
