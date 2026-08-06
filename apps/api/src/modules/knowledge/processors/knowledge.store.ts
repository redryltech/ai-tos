import { Inject, Injectable } from '@nestjs/common';
import {
  KNOWLEDGE_PROVIDER,
  type IKnowledgeStore,
} from '../contracts/knowledge.contracts';
import type {
  KnowledgeChunk,
  KnowledgeCollection,
  KnowledgeDocument,
  KnowledgeIndexEntry,
} from '../models/knowledge.models';
import type { IKnowledgeProvider } from '../providers/knowledge.provider';

/**
 * Knowledge Store — persist documents/metadata/indexes via provider only.
 */
@Injectable()
export class KnowledgeStore implements IKnowledgeStore {
  constructor(
    @Inject(KNOWLEDGE_PROVIDER) private readonly provider: IKnowledgeProvider,
  ) {}

  async save(
    document: KnowledgeDocument,
    chunks: readonly KnowledgeChunk[],
    indexEntries: readonly KnowledgeIndexEntry[],
  ): Promise<KnowledgeDocument> {
    const saved = await this.provider.saveDocument(document);
    await this.provider.saveChunks(chunks);
    await this.provider.saveIndexEntries(indexEntries);
    return saved;
  }

  async get(id: string): Promise<KnowledgeDocument | null> {
    return this.provider.findDocumentById(id);
  }

  async update(document: KnowledgeDocument): Promise<KnowledgeDocument> {
    return this.provider.saveDocument(document);
  }

  async delete(id: string): Promise<void> {
    await this.provider.deleteDocument(id);
  }

  async list(): Promise<KnowledgeCollection> {
    const items = await this.provider.listDocuments();
    return Object.freeze({
      items: Object.freeze([...items]),
      total: items.length,
      querySummary: `list;driver=${this.provider.driver};total=${items.length}`,
    });
  }
}
