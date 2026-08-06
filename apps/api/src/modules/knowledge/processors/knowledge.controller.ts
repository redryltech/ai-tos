import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  DOCUMENT_LOADER,
  KNOWLEDGE_INDEX_MANAGER,
  KNOWLEDGE_PARSER,
  KNOWLEDGE_STORE,
  RETRIEVAL_ENGINE,
  type IDocumentLoader,
  type IKnowledgeController,
  type IKnowledgeIndexManager,
  type IKnowledgeParser,
  type IKnowledgeStore,
  type IRetrievalEngine,
} from '../contracts/knowledge.contracts';
import type {
  IngestKnowledgeDto,
  KnowledgeQueryDto,
  UpdateKnowledgeDocumentDto,
} from '../dto/knowledge.dto';
import type {
  KnowledgeCollection,
  KnowledgeDocument,
} from '../models/knowledge.models';

/**
 * Knowledge Controller — orchestrate load → parse → index → store → retrieve.
 * Never cognizes or generates embeddings.
 */
@Injectable()
export class KnowledgeController implements IKnowledgeController {
  constructor(
    @Inject(DOCUMENT_LOADER) private readonly loader: IDocumentLoader,
    @Inject(KNOWLEDGE_PARSER) private readonly parser: IKnowledgeParser,
    @Inject(KNOWLEDGE_INDEX_MANAGER)
    private readonly indexManager: IKnowledgeIndexManager,
    @Inject(KNOWLEDGE_STORE) private readonly store: IKnowledgeStore,
    @Inject(RETRIEVAL_ENGINE) private readonly retrieval: IRetrievalEngine,
  ) {}

  async ingest(source: IngestKnowledgeDto): Promise<KnowledgeCollection> {
    const loaded = this.loader.load(source);
    const parsed = this.parser.parse(loaded);
    const now = new Date().toISOString();
    const documentId = source.id?.trim() || randomUUID();

    const draft: KnowledgeDocument = Object.freeze({
      id: documentId,
      title: source.title?.trim() || parsed.title,
      sourceType: loaded.sourceType,
      sourceUri: loaded.sourceUri,
      content: parsed.text,
      sections: parsed.sections,
      tables: parsed.tables,
      references: parsed.references,
      tags: Object.freeze([...(source.tags ?? [])]),
      organizationId: source.organizationId,
      userId: source.userId,
      metadata: Object.freeze({
        ...parsed.metadata,
        ...(source.metadata ?? {}),
      }),
      chunkIds: Object.freeze([] as string[]),
      createdAt: now,
      updatedAt: now,
      schemaVersion: '1.0.0',
    });

    const chunks = this.indexManager.chunk(documentId, parsed.text);
    const withChunks: KnowledgeDocument = Object.freeze({
      ...draft,
      chunkIds: Object.freeze(chunks.map((c) => c.id)),
    });
    const indexEntries = await this.indexManager.buildIndex(withChunks, chunks);
    const saved = await this.store.save(withChunks, chunks, indexEntries);

    return Object.freeze({
      items: Object.freeze([saved]),
      total: 1,
      querySummary: `ingest;id=${saved.id};chunks=${chunks.length}`,
    });
  }

  async retrieve(query: KnowledgeQueryDto): Promise<KnowledgeCollection> {
    return this.retrieval.retrieve(query ?? {});
  }

  async search(query: KnowledgeQueryDto): Promise<KnowledgeCollection> {
    return this.retrieval.search(query ?? {});
  }

  async update(document: UpdateKnowledgeDocumentDto): Promise<KnowledgeDocument> {
    if (!document?.id) throw new Error('UpdateKnowledgeDocumentDto.id is required');
    const existing = await this.store.get(document.id);
    if (!existing) throw new Error(`Knowledge document not found: ${document.id}`);

    const content = document.content?.trim() ?? existing.content;
    const updatedBase: KnowledgeDocument = Object.freeze({
      ...existing,
      title: document.title?.trim() ?? existing.title,
      content,
      tags: Object.freeze([...(document.tags ?? existing.tags)]),
      metadata: Object.freeze({
        ...existing.metadata,
        ...(document.metadata ?? {}),
      }),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
    });

    if (document.content != null) {
      const chunks = this.indexManager.chunk(existing.id, content);
      const withChunks: KnowledgeDocument = Object.freeze({
        ...updatedBase,
        chunkIds: Object.freeze(chunks.map((c) => c.id)),
      });
      const indexEntries = await this.indexManager.buildIndex(withChunks, chunks);
      return this.store.save(withChunks, chunks, indexEntries);
    }

    return this.store.update(updatedBase);
  }

  async delete(documentId: string): Promise<void> {
    if (!documentId?.trim()) throw new Error('documentId is required');
    await this.store.delete(documentId);
  }

  async list(): Promise<KnowledgeCollection> {
    return this.store.list();
  }
}
