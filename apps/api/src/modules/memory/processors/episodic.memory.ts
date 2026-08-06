import { Inject, Injectable } from '@nestjs/common';
import type { IEpisodicMemory } from '../contracts/memory.contracts';
import { MEMORY_PROVIDER } from '../contracts/memory.contracts';
import type { MemoryQueryDto } from '../dto/memory.dto';
import type { MemoryCollection, MemoryRecord } from '../models/memory.models';
import type { IMemoryProvider } from '../providers/memory.provider';

/**
 * Episodic Memory — events, successes, failures, lessons learned.
 */
@Injectable()
export class EpisodicMemory implements IEpisodicMemory {
  constructor(@Inject(MEMORY_PROVIDER) private readonly provider: IMemoryProvider) {}

  async store(record: MemoryRecord): Promise<MemoryRecord> {
    if (record.kind !== 'episodic') {
      throw new Error('EpisodicMemory only stores episodic kind');
    }
    return this.provider.save(record);
  }

  async recall(query: MemoryQueryDto): Promise<MemoryCollection> {
    return this.provider.findMany({
      kind: 'episodic',
      userId: query.userId,
      organizationId: query.organizationId,
      sessionId: query.sessionId,
      tags: query.tags,
      text: query.text,
      limit: query.limit,
      status: query.includeArchived ? ['active', 'archived'] : 'active',
    });
  }
}
