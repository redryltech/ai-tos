import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import {
  EMBEDDING_CAPABILITY_PORT,
  type IEmbeddingCapabilityPort,
  type IKnowledgeIndexManager,
} from '../contracts/knowledge.contracts';
import type {
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeIndexEntry,
} from '../models/knowledge.models';
import { tokenize } from '../providers/in-memory.knowledge.provider';

/**
 * Knowledge Index Manager — chunking + searchable indexes.
 * Embedding generation is external (Capability Service port / no-op today).
 */
@Injectable()
export class KnowledgeIndexManager implements IKnowledgeIndexManager {
  constructor(
    private readonly config: ConfigService,
    @Inject(EMBEDDING_CAPABILITY_PORT)
    private readonly embeddingPort: IEmbeddingCapabilityPort,
  ) {}

  chunk(documentId: string, text: string): KnowledgeChunk[] {
    const size = this.config.knowledge.chunkSize;
    const overlap = Math.min(
      this.config.knowledge.chunkOverlap,
      Math.max(0, size - 1),
    );
    const chunks: KnowledgeChunk[] = [];
    if (!text) return chunks;

    let start = 0;
    let index = 0;
    while (start < text.length) {
      const end = Math.min(text.length, start + size);
      const slice = text.slice(start, end);
      chunks.push(
        Object.freeze({
          id: randomUUID(),
          documentId,
          index,
          text: slice,
          metadata: Object.freeze({
            start,
            end,
            length: slice.length,
          }),
        }),
      );
      index += 1;
      if (end >= text.length) break;
      start = end - overlap;
    }
    return chunks;
  }

  async buildIndex(
    document: KnowledgeDocument,
    chunks: readonly KnowledgeChunk[],
  ): Promise<readonly KnowledgeIndexEntry[]> {
    // Request embedding refs via port — returns empty placeholders until Capability Service exists.
    const embeddingRefs = await this.embeddingPort.requestEmbeddingRefs(
      chunks.map((c) => c.text),
    );

    const entries = chunks.map((chunk, i) =>
      Object.freeze({
        chunkId: chunk.id,
        documentId: document.id,
        tokens: Object.freeze(tokenize(`${document.title} ${chunk.text}`)),
        metadata: Object.freeze({
          ...chunk.metadata,
          tags: document.tags.join(','),
          sourceType: document.sourceType,
        }),
        embeddingRef: embeddingRefs[i] || undefined,
      }),
    );

    return Object.freeze(entries);
  }
}
