/** Knowledge Service domain models (Layer 4.2). Facts/documents — not experiences. */

export type KnowledgeSourceType =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'markdown'
  | 'html'
  | 'csv'
  | 'json'
  | 'xml'
  | 'database'
  | 'rest_api'
  | 'cloud_storage'
  | 'enterprise_repository'
  | 'git_repository'
  | 'inline';

export type KnowledgeSearchMode = 'keyword' | 'semantic' | 'hybrid' | 'metadata';

export interface KnowledgeChunk {
  readonly id: string;
  readonly documentId: string;
  readonly index: number;
  readonly text: string;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface KnowledgeIndexEntry {
  readonly chunkId: string;
  readonly documentId: string;
  readonly tokens: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  /** Placeholder for future Capability Service embeddings — never generated here. */
  readonly embeddingRef?: string;
}

export interface KnowledgeDocument {
  readonly id: string;
  readonly title: string;
  readonly sourceType: KnowledgeSourceType;
  readonly sourceUri?: string;
  readonly content: string;
  readonly sections: readonly string[];
  readonly tables: readonly string[];
  readonly references: readonly string[];
  readonly tags: readonly string[];
  readonly organizationId?: string;
  readonly userId?: string;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly chunkIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly schemaVersion: '1.0.0';
}

export interface KnowledgeHit {
  readonly document: KnowledgeDocument;
  readonly score: number;
  readonly matchedChunkIds: readonly string[];
  readonly mode: KnowledgeSearchMode;
}

export interface KnowledgeCollection {
  readonly items: readonly KnowledgeDocument[];
  readonly hits?: readonly KnowledgeHit[];
  readonly total: number;
  readonly querySummary: string;
}

export interface ParsedKnowledge {
  readonly text: string;
  readonly title: string;
  readonly sections: readonly string[];
  readonly tables: readonly string[];
  readonly references: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface LoadedKnowledgeSource {
  readonly sourceType: KnowledgeSourceType;
  readonly sourceUri?: string;
  readonly rawContent: string;
  readonly mimeType?: string;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}
