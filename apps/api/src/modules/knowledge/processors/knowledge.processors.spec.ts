import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import { InMemoryKnowledgeProvider } from '../providers/in-memory.knowledge.provider';
import { NoopEmbeddingCapabilityPort } from '../providers/noop-embedding.port';
import { DocumentLoader } from './document.loader';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeIndexManager } from './knowledge.index-manager';
import { KnowledgeParser } from './knowledge.parser';
import { KnowledgeStore } from './knowledge.store';
import { RetrievalEngine } from './retrieval.engine';

function createStack(): {
  controller: KnowledgeController;
  provider: InMemoryKnowledgeProvider;
  loader: DocumentLoader;
  parser: KnowledgeParser;
  indexManager: KnowledgeIndexManager;
  store: KnowledgeStore;
  retrieval: RetrievalEngine;
} {
  const config = new ConfigService();
  const provider = new InMemoryKnowledgeProvider(config.knowledge.maxDocuments);
  const loader = new DocumentLoader();
  const parser = new KnowledgeParser();
  const indexManager = new KnowledgeIndexManager(
    config,
    new NoopEmbeddingCapabilityPort(),
  );
  const store = new KnowledgeStore(provider);
  const retrieval = new RetrievalEngine(config, provider);
  const controller = new KnowledgeController(
    loader,
    parser,
    indexManager,
    store,
    retrieval,
  );
  return { controller, provider, loader, parser, indexManager, store, retrieval };
}

describe('DocumentLoader', () => {
  const loader = new DocumentLoader();

  it('loads inline content and infers types', () => {
    const loaded = loader.load({ content: 'hello world', sourceType: 'txt' });
    assert.equal(loaded.sourceType, 'txt');
    assert.equal(loaded.rawContent, 'hello world');
  });

  it('infers markdown/json/html from uri/mime', () => {
    assert.equal(
      loader.load({ sourceUri: 's3://bucket/a.md', content: '# Title' }).sourceType,
      'markdown',
    );
    assert.equal(
      loader.load({ mimeType: 'application/json', content: '{}' }).sourceType,
      'json',
    );
    assert.equal(
      loader.load({ sourceUri: 'https://x.test/page.html', content: '<p>a</p>' })
        .sourceType,
      'html',
    );
  });

  it('rejects empty ingest', () => {
    assert.throws(() => loader.load({}), /content or sourceUri/i);
  });
});

describe('KnowledgeParser', () => {
  it('extracts text structure without AI', () => {
    const parser = new KnowledgeParser();
    const parsed = parser.parse({
      sourceType: 'markdown',
      rawContent: '# Intro\n\nBody https://example.com\n\n| a | b |\n',
      metadata: { titleHint: 'Doc' },
    });
    assert.equal(parsed.title, 'Doc');
    assert.ok(parsed.sections.length >= 1);
    assert.ok(parsed.references.some((r) => r.includes('example.com')));
    assert.ok(parsed.tables.length >= 1);
  });
});

describe('IndexManager + Store + Retrieval', () => {
  it('chunks indexes stores and retrieves', async () => {
    const { controller, indexManager } = createStack();
    const collection = await controller.ingest({
      title: 'Python Guide',
      content:
        'Python is a programming language. Prefer typed APIs. Retrieval uses keyword indexes.',
      tags: ['python'],
      organizationId: 'o1',
    });
    assert.equal(collection.total, 1);
    assert.ok(collection.items[0]!.chunkIds.length >= 1);

    const chunks = indexManager.chunk('d1', 'abcdefghij'.repeat(80));
    assert.ok(chunks.length > 1);

    const found = await controller.search({
      text: 'Python programming',
      mode: 'hybrid',
      organizationId: 'o1',
    });
    assert.ok(found.total >= 1);
    assert.ok(found.hits && found.hits[0]!.score > 0);
  });
});

describe('KnowledgeController lifecycle', () => {
  it('update delete list', async () => {
    const { controller } = createStack();
    const ingested = await controller.ingest({
      content: 'Alpha knowledge document about markets',
      tags: ['markets'],
    });
    const id = ingested.items[0]!.id;

    const updated = await controller.update({
      id,
      title: 'Markets Doc',
      content: 'Updated markets knowledge with volatility notes',
    });
    assert.equal(updated.title, 'Markets Doc');
    assert.ok(updated.chunkIds.length >= 1);

    const listed = await controller.list();
    assert.ok(listed.items.some((d) => d.id === id));

    await controller.delete(id);
    const after = await controller.list();
    assert.equal(after.items.some((d) => d.id === id), false);
  });
});

describe('InMemoryKnowledgeProvider', () => {
  it('persists documents chunks and index entries', async () => {
    const provider = new InMemoryKnowledgeProvider(100);
    const doc = {
      id: 'kd1',
      title: 'T',
      sourceType: 'txt' as const,
      content: 'content',
      sections: [],
      tables: [],
      references: [],
      tags: [],
      metadata: {},
      chunkIds: ['c1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0' as const,
    };
    await provider.saveDocument(doc);
    await provider.saveChunks([
      {
        id: 'c1',
        documentId: 'kd1',
        index: 0,
        text: 'content',
        metadata: {},
      },
    ]);
    await provider.saveIndexEntries([
      {
        chunkId: 'c1',
        documentId: 'kd1',
        tokens: ['content'],
        metadata: {},
      },
    ]);
    assert.equal((await provider.findDocumentById('kd1'))?.id, 'kd1');
    assert.equal((await provider.findChunksByDocumentId('kd1')).length, 1);
    assert.equal((await provider.findIndexEntries({ text: 'content' })).length, 1);
  });
});
