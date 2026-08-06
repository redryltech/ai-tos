import type {
  IngestKnowledgeDto,
  KnowledgeQueryDto,
  UpdateKnowledgeDocumentDto,
} from '../dto/knowledge.dto';
import type {
  KnowledgeCollection,
  KnowledgeDocument,
  KnowledgeIndexEntry,
  KnowledgeChunk,
  LoadedKnowledgeSource,
  ParsedKnowledge,
} from '../models/knowledge.models';
import type {
  IEmbeddingCapabilityPort,
  IKnowledgeProvider,
} from '../providers/knowledge.provider';

export const KNOWLEDGE_PROVIDER = Symbol('KNOWLEDGE_PROVIDER');
export const EMBEDDING_CAPABILITY_PORT = Symbol('EMBEDDING_CAPABILITY_PORT');
export const DOCUMENT_LOADER = Symbol('DOCUMENT_LOADER');
export const KNOWLEDGE_PARSER = Symbol('KNOWLEDGE_PARSER');
export const KNOWLEDGE_INDEX_MANAGER = Symbol('KNOWLEDGE_INDEX_MANAGER');
export const KNOWLEDGE_STORE = Symbol('KNOWLEDGE_STORE');
export const RETRIEVAL_ENGINE = Symbol('RETRIEVAL_ENGINE');
export const KNOWLEDGE_CONTROLLER = Symbol('KNOWLEDGE_CONTROLLER');
export const KNOWLEDGE_SERVICE = Symbol('KNOWLEDGE_SERVICE');

export interface IDocumentLoader {
  load(source: IngestKnowledgeDto): LoadedKnowledgeSource;
}

export interface IKnowledgeParser {
  parse(loaded: LoadedKnowledgeSource): ParsedKnowledge;
}

export interface IKnowledgeIndexManager {
  chunk(documentId: string, text: string): KnowledgeChunk[];
  buildIndex(
    document: KnowledgeDocument,
    chunks: readonly KnowledgeChunk[],
  ): Promise<readonly KnowledgeIndexEntry[]>;
}

export interface IKnowledgeStore {
  save(
    document: KnowledgeDocument,
    chunks: readonly KnowledgeChunk[],
    indexEntries: readonly KnowledgeIndexEntry[],
  ): Promise<KnowledgeDocument>;
  get(id: string): Promise<KnowledgeDocument | null>;
  update(document: KnowledgeDocument): Promise<KnowledgeDocument>;
  delete(id: string): Promise<void>;
  list(): Promise<KnowledgeCollection>;
}

export interface IRetrievalEngine {
  retrieve(query: KnowledgeQueryDto): Promise<KnowledgeCollection>;
  search(query: KnowledgeQueryDto): Promise<KnowledgeCollection>;
}

export interface IKnowledgeController {
  ingest(source: IngestKnowledgeDto): Promise<KnowledgeCollection>;
  retrieve(query: KnowledgeQueryDto): Promise<KnowledgeCollection>;
  search(query: KnowledgeQueryDto): Promise<KnowledgeCollection>;
  update(document: UpdateKnowledgeDocumentDto): Promise<KnowledgeDocument>;
  delete(documentId: string): Promise<void>;
  list(): Promise<KnowledgeCollection>;
}

/** Sole public Knowledge Service contract. */
export interface IKnowledgeService {
  ingest(source: IngestKnowledgeDto): Promise<KnowledgeCollection>;
  retrieve(query: KnowledgeQueryDto): Promise<KnowledgeCollection>;
  search(query: KnowledgeQueryDto): Promise<KnowledgeCollection>;
  update(document: UpdateKnowledgeDocumentDto): Promise<KnowledgeDocument>;
  delete(documentId: string): Promise<void>;
  list(): Promise<KnowledgeCollection>;
}

export type { IEmbeddingCapabilityPort, IKnowledgeProvider };
