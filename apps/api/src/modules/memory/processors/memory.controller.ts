import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  EPISODIC_MEMORY,
  LONG_TERM_MEMORY,
  MEMORY_EVALUATOR,
  MEMORY_PROVIDER,
  SESSION_MEMORY,
  type IEpisodicMemory,
  type ILongTermMemory,
  type IMemoryController,
  type IMemoryEvaluator,
  type IMemoryProvider,
  type ISessionMemory,
} from '../contracts/memory.contracts';
import type {
  MemoryQueryDto,
  RememberMemoryDto,
  UpdateMemoryDto,
} from '../dto/memory.dto';
import type { MemoryCollection, MemoryRecord } from '../models/memory.models';

/**
 * Memory Controller — orchestrate evaluate → store → index/recall/update/archive/forget.
 * Never performs cognition.
 */
@Injectable()
export class MemoryController implements IMemoryController {
  constructor(
    @Inject(MEMORY_EVALUATOR) private readonly evaluator: IMemoryEvaluator,
    @Inject(SESSION_MEMORY) private readonly sessionMemory: ISessionMemory,
    @Inject(LONG_TERM_MEMORY) private readonly longTermMemory: ILongTermMemory,
    @Inject(EPISODIC_MEMORY) private readonly episodicMemory: IEpisodicMemory,
    @Inject(MEMORY_PROVIDER) private readonly provider: IMemoryProvider,
  ) {}

  async remember(input: RememberMemoryDto): Promise<MemoryRecord | null> {
    if (!input || typeof input.content !== 'string') {
      throw new Error('RememberMemoryDto.content is required');
    }

    const evaluation = this.evaluator.evaluate(input);
    if (!evaluation.store) {
      return null;
    }

    const now = new Date().toISOString();
    const expiresAt =
      evaluation.ttlSeconds != null && evaluation.ttlSeconds > 0
        ? new Date(Date.now() + evaluation.ttlSeconds * 1000).toISOString()
        : undefined;

    const record: MemoryRecord = Object.freeze({
      id: input.id?.trim() || randomUUID(),
      kind: evaluation.kind,
      status: 'active',
      content: input.content.trim(),
      summary: (input.summary ?? input.content).trim().slice(0, 240),
      userId: input.userId,
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      tags: Object.freeze([...(input.tags ?? [])]),
      importance: evaluation.importance,
      metadata: Object.freeze({
        ...(input.metadata ?? {}),
        evaluationReason: evaluation.reason,
        providerDriver: this.provider.driver,
      }),
      createdAt: now,
      updatedAt: now,
      expiresAt,
      schemaVersion: '1.0.0',
    });

    return this.routeStore(record);
  }

  async recall(query: MemoryQueryDto): Promise<MemoryCollection> {
    if (query.kind === 'session') return this.sessionMemory.recall(query);
    if (query.kind === 'long_term') return this.longTermMemory.recall(query);
    if (query.kind === 'episodic') return this.episodicMemory.recall(query);

    const [session, longTerm, episodic] = await Promise.all([
      this.sessionMemory.recall(query),
      this.longTermMemory.recall(query),
      this.episodicMemory.recall(query),
    ]);
    const items = Object.freeze([
      ...session.items,
      ...longTerm.items,
      ...episodic.items,
    ].slice(0, query.limit ?? 100));

    return Object.freeze({
      items,
      total: items.length,
      querySummary: `recall:all;matched=${items.length}`,
    });
  }

  async update(input: UpdateMemoryDto): Promise<MemoryRecord> {
    if (!input?.id) throw new Error('UpdateMemoryDto.id is required');
    const existing = await this.provider.findById(input.id);
    if (!existing || existing.status === 'forgotten') {
      throw new Error(`Memory not found: ${input.id}`);
    }

    const updated: MemoryRecord = Object.freeze({
      ...existing,
      content: input.content?.trim() ?? existing.content,
      summary: input.summary?.trim() ?? existing.summary,
      tags: Object.freeze([...(input.tags ?? existing.tags)]),
      importance: input.importance ?? existing.importance,
      kind: input.kind ?? existing.kind,
      metadata: Object.freeze({
        ...existing.metadata,
        ...(input.metadata ?? {}),
      }),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
    });

    // Kind change: rewrite via provider (stores are kind-gated on write path).
    return this.provider.save(updated);
  }

  async forget(memoryId: string): Promise<void> {
    if (!memoryId?.trim()) throw new Error('memoryId is required');
    const existing = await this.provider.findById(memoryId);
    if (!existing) return;
    await this.provider.save(
      Object.freeze({
        ...existing,
        status: 'forgotten',
        updatedAt: new Date().toISOString(),
        schemaVersion: '1.0.0',
      }),
    );
    await this.provider.delete(memoryId);
  }

  async archive(memoryId: string): Promise<void> {
    if (!memoryId?.trim()) throw new Error('memoryId is required');
    const existing = await this.provider.findById(memoryId);
    if (!existing || existing.status === 'forgotten') {
      throw new Error(`Memory not found: ${memoryId}`);
    }
    await this.provider.save(
      Object.freeze({
        ...existing,
        status: 'archived',
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schemaVersion: '1.0.0',
      }),
    );
  }

  async search(query: MemoryQueryDto): Promise<MemoryCollection> {
    const result = await this.provider.findMany({
      kind: query.kind,
      userId: query.userId,
      organizationId: query.organizationId,
      sessionId: query.sessionId,
      tags: query.tags,
      text: query.text,
      limit: query.limit ?? 100,
      status: query.includeArchived ? ['active', 'archived'] : 'active',
    });
    return Object.freeze({
      ...result,
      querySummary: `search;${result.querySummary}`,
    });
  }

  private async routeStore(record: MemoryRecord): Promise<MemoryRecord> {
    if (record.kind === 'session') return this.sessionMemory.store(record);
    if (record.kind === 'long_term') return this.longTermMemory.store(record);
    return this.episodicMemory.store(record);
  }
}
