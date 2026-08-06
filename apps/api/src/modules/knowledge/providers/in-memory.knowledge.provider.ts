import type {
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeIndexEntry,
} from '../models/knowledge.models';
import type {
  IKnowledgeProvider,
  KnowledgeProviderFilter,
} from './knowledge.provider';

/**
 * In-process Knowledge Provider — default backend.
 * Swap via IKnowledgeProvider for Postgres/OpenSearch/Qdrant/etc.
 */
export class InMemoryKnowledgeProvider implements IKnowledgeProvider {
  readonly driver = 'memory';
  private readonly documents = new Map<string, KnowledgeDocument>();
  private readonly chunks = new Map<string, KnowledgeChunk[]>();
  private readonly index = new Map<string, KnowledgeIndexEntry>();

  constructor(private readonly maxDocuments: number) {}

  async saveDocument(document: KnowledgeDocument): Promise<KnowledgeDocument> {
    if (this.documents.size >= this.maxDocuments && !this.documents.has(document.id)) {
      const oldest = this.documents.keys().next().value as string | undefined;
      if (oldest != null) {
        this.documents.delete(oldest);
        this.chunks.delete(oldest);
        for (const [chunkId, entry] of this.index) {
          if (entry.documentId === oldest) this.index.delete(chunkId);
        }
      }
    }
    const frozen = Object.freeze({ ...document }) as KnowledgeDocument;
    this.documents.set(document.id, frozen);
    return frozen;
  }

  async saveChunks(chunks: readonly KnowledgeChunk[]): Promise<void> {
    const byDoc = new Map<string, KnowledgeChunk[]>();
    for (const chunk of chunks) {
      const list = byDoc.get(chunk.documentId) ?? [];
      list.push(Object.freeze({ ...chunk }) as KnowledgeChunk);
      byDoc.set(chunk.documentId, list);
    }
    for (const [documentId, list] of byDoc) {
      this.chunks.set(documentId, list);
    }
  }

  async saveIndexEntries(entries: readonly KnowledgeIndexEntry[]): Promise<void> {
    for (const entry of entries) {
      this.index.set(entry.chunkId, Object.freeze({ ...entry }) as KnowledgeIndexEntry);
    }
  }

  async findDocumentById(id: string): Promise<KnowledgeDocument | null> {
    return this.documents.get(id) ?? null;
  }

  async findDocuments(filter: KnowledgeProviderFilter): Promise<readonly KnowledgeDocument[]> {
    const limit = filter.limit ?? 100;
    const text = filter.text?.trim().toLowerCase();
    const items: KnowledgeDocument[] = [];
    for (const doc of this.documents.values()) {
      if (filter.organizationId && doc.organizationId !== filter.organizationId) continue;
      if (filter.userId && doc.userId !== filter.userId) continue;
      if (filter.sourceType && doc.sourceType !== filter.sourceType) continue;
      if (filter.documentIds?.length && !filter.documentIds.includes(doc.id)) continue;
      if (filter.tags?.length) {
        const tagSet = new Set(doc.tags);
        if (!filter.tags.every((t) => tagSet.has(t))) continue;
      }
      if (filter.filters) {
        let ok = true;
        for (const [k, v] of Object.entries(filter.filters)) {
          if (doc.metadata[k] !== v) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
      }
      if (text) {
        const hay = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(text)) continue;
      }
      items.push(doc);
      if (items.length >= limit) break;
    }
    return Object.freeze(items);
  }

  async findChunksByDocumentId(documentId: string): Promise<readonly KnowledgeChunk[]> {
    return Object.freeze([...(this.chunks.get(documentId) ?? [])]);
  }

  async findIndexEntries(
    filter: KnowledgeProviderFilter,
  ): Promise<readonly KnowledgeIndexEntry[]> {
    const text = filter.text?.trim().toLowerCase();
    const queryTokens = text ? tokenize(text) : [];
    const limit = filter.limit ?? 100;
    const items: KnowledgeIndexEntry[] = [];
    for (const entry of this.index.values()) {
      if (filter.documentIds?.length && !filter.documentIds.includes(entry.documentId)) {
        continue;
      }
      if (queryTokens.length > 0) {
        const hit = queryTokens.some((t) => entry.tokens.includes(t));
        if (!hit) continue;
      }
      items.push(entry);
      if (items.length >= limit) break;
    }
    return Object.freeze(items);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const existed = this.documents.delete(id);
    this.chunks.delete(id);
    for (const [chunkId, entry] of this.index) {
      if (entry.documentId === id) this.index.delete(chunkId);
    }
    return existed;
  }

  async listDocuments(limit = 100): Promise<readonly KnowledgeDocument[]> {
    return Object.freeze([...this.documents.values()].slice(0, limit));
  }

  async clear(): Promise<void> {
    this.documents.clear();
    this.chunks.clear();
    this.index.clear();
  }
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}
