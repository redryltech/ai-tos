import type {
  KnowledgeSearchMode,
  KnowledgeSourceType,
} from '../models/knowledge.models';

/** Input for ingest() — knowledge source descriptor. */
export interface IngestKnowledgeDto {
  readonly id?: string;
  readonly title?: string;
  readonly sourceType?: KnowledgeSourceType;
  readonly sourceUri?: string;
  /** Inline textual / serialized payload for supported formats. */
  readonly content?: string;
  readonly mimeType?: string;
  readonly tags?: readonly string[];
  readonly organizationId?: string;
  readonly userId?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

/** Input for update(). */
export interface UpdateKnowledgeDocumentDto {
  readonly id: string;
  readonly title?: string;
  readonly content?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

/** Query for retrieve() / search(). */
export interface KnowledgeQueryDto {
  readonly text?: string;
  readonly mode?: KnowledgeSearchMode;
  readonly tags?: readonly string[];
  readonly organizationId?: string;
  readonly userId?: string;
  readonly sourceType?: KnowledgeSourceType;
  readonly topK?: number;
  readonly filters?: Readonly<Record<string, string | number | boolean | null>>;
}
