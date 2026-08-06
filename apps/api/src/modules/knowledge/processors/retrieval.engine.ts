import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import {
  KNOWLEDGE_PROVIDER,
  type IRetrievalEngine,
} from '../contracts/knowledge.contracts';
import type { KnowledgeQueryDto } from '../dto/knowledge.dto';
import type {
  KnowledgeCollection,
  KnowledgeHit,
  KnowledgeSearchMode,
} from '../models/knowledge.models';
import { tokenize } from '../providers/in-memory.knowledge.provider';
import type { IKnowledgeProvider } from '../providers/knowledge.provider';

/**
 * Retrieval Engine — keyword / metadata / hybrid / semantic-placeholder ranking.
 * Never reasons, summarizes, or calls AI models.
 */
@Injectable()
export class RetrievalEngine implements IRetrievalEngine {
  constructor(
    private readonly config: ConfigService,
    @Inject(KNOWLEDGE_PROVIDER) private readonly provider: IKnowledgeProvider,
  ) {}

  async retrieve(query: KnowledgeQueryDto): Promise<KnowledgeCollection> {
    return this.search(query);
  }

  async search(query: KnowledgeQueryDto): Promise<KnowledgeCollection> {
    const mode: KnowledgeSearchMode =
      query.mode ?? this.config.knowledge.searchMode;
    const topK = query.topK ?? this.config.knowledge.defaultTopK;

    if (mode === 'metadata') {
      const docs = await this.provider.findDocuments({
        tags: query.tags,
        organizationId: query.organizationId,
        userId: query.userId,
        sourceType: query.sourceType,
        filters: query.filters,
        limit: topK,
      });
      const hits = docs.map((document) =>
        Object.freeze({
          document,
          score: 1,
          matchedChunkIds: Object.freeze([...document.chunkIds]),
          mode,
        }),
      );
      return this.toCollection(hits, mode, 'metadata');
    }

    const text = query.text?.trim() ?? '';
    if (!text) {
      const docs = await this.provider.findDocuments({
        tags: query.tags,
        organizationId: query.organizationId,
        userId: query.userId,
        sourceType: query.sourceType,
        filters: query.filters,
        limit: topK,
      });
      const hits = docs.map((document) =>
        Object.freeze({
          document,
          score: 0.5,
          matchedChunkIds: Object.freeze([] as string[]),
          mode,
        }),
      );
      return this.toCollection(hits, mode, 'empty_query');
    }

    const indexEntries = await this.provider.findIndexEntries({
      text,
      limit: topK * 5,
    });
    const queryTokens = tokenize(text);
    const scoreByDoc = new Map<string, { score: number; chunkIds: string[] }>();

    for (const entry of indexEntries) {
      const overlap = queryTokens.filter((t) => entry.tokens.includes(t)).length;
      const keywordScore = queryTokens.length
        ? overlap / queryTokens.length
        : 0;
      // Semantic placeholder: use token overlap until Capability Service embeddings exist.
      const semanticScore = keywordScore;
      const score =
        mode === 'keyword'
          ? keywordScore
          : mode === 'semantic'
            ? semanticScore
            : 0.6 * keywordScore + 0.4 * semanticScore;

      if (score <= 0) continue;
      const current = scoreByDoc.get(entry.documentId) ?? {
        score: 0,
        chunkIds: [],
      };
      current.score = Math.max(current.score, score);
      current.chunkIds.push(entry.chunkId);
      scoreByDoc.set(entry.documentId, current);
    }

    // Also include direct document text matches for hybrid/keyword.
    if (mode === 'keyword' || mode === 'hybrid') {
      const docs = await this.provider.findDocuments({
        text,
        tags: query.tags,
        organizationId: query.organizationId,
        userId: query.userId,
        sourceType: query.sourceType,
        filters: query.filters,
        limit: topK,
      });
      for (const doc of docs) {
        const current = scoreByDoc.get(doc.id) ?? { score: 0, chunkIds: [] };
        current.score = Math.max(current.score, 0.55);
        scoreByDoc.set(doc.id, current);
      }
    }

    const ranked = [...scoreByDoc.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, topK);

    const hits: KnowledgeHit[] = [];
    for (const [documentId, info] of ranked) {
      const document = await this.provider.findDocumentById(documentId);
      if (!document) continue;
      if (query.organizationId && document.organizationId !== query.organizationId) {
        continue;
      }
      if (query.userId && document.userId !== query.userId) continue;
      if (query.sourceType && document.sourceType !== query.sourceType) continue;
      if (query.tags?.length) {
        const tagSet = new Set(document.tags);
        if (!query.tags.every((t) => tagSet.has(t))) continue;
      }
      hits.push(
        Object.freeze({
          document,
          score: Number(info.score.toFixed(4)),
          matchedChunkIds: Object.freeze([...new Set(info.chunkIds)]),
          mode,
        }),
      );
    }

    return this.toCollection(hits, mode, text.slice(0, 80));
  }

  private toCollection(
    hits: readonly KnowledgeHit[],
    mode: KnowledgeSearchMode,
    detail: string,
  ): KnowledgeCollection {
    const items = Object.freeze(hits.map((h) => h.document));
    return Object.freeze({
      items,
      hits: Object.freeze([...hits]),
      total: items.length,
      querySummary: `search;mode=${mode};matched=${items.length};q=${detail}`,
    });
  }
}
