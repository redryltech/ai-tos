import type {
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeIndexEntry,
} from '../models/knowledge.models';
import type { KnowledgeQueryDto } from '../dto/knowledge.dto';

/** Storage-independent Knowledge Provider contract. */
export interface KnowledgeProviderFilter {
  readonly text?: string;
  readonly tags?: readonly string[];
  readonly organizationId?: string;
  readonly userId?: string;
  readonly sourceType?: string;
  readonly documentIds?: readonly string[];
  readonly limit?: number;
  readonly filters?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface IKnowledgeProvider {
  readonly driver: string;
  saveDocument(document: KnowledgeDocument): Promise<KnowledgeDocument>;
  saveChunks(chunks: readonly KnowledgeChunk[]): Promise<void>;
  saveIndexEntries(entries: readonly KnowledgeIndexEntry[]): Promise<void>;
  findDocumentById(id: string): Promise<KnowledgeDocument | null>;
  findDocuments(filter: KnowledgeProviderFilter): Promise<readonly KnowledgeDocument[]>;
  findChunksByDocumentId(documentId: string): Promise<readonly KnowledgeChunk[]>;
  findIndexEntries(filter: KnowledgeProviderFilter): Promise<readonly KnowledgeIndexEntry[]>;
  deleteDocument(id: string): Promise<boolean>;
  listDocuments(limit?: number): Promise<readonly KnowledgeDocument[]>;
  clear?(): Promise<void>;
}

/**
 * Future Capability Service hook for embeddings.
 * Knowledge Service must NOT generate embeddings itself.
 */
export interface IEmbeddingCapabilityPort {
  /**
   * Request embedding refs for texts. Default no-op until Capability Service exists.
   */
  requestEmbeddingRefs(texts: readonly string[]): Promise<readonly string[]>;
}
