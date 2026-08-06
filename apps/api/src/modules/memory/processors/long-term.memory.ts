import { Inject, Injectable } from '@nestjs/common';
import type { ILongTermMemory } from '../contracts/memory.contracts';
import { MEMORY_PROVIDER } from '../contracts/memory.contracts';
import type { MemoryQueryDto } from '../dto/memory.dto';
import type { MemoryCollection, MemoryRecord } from '../models/memory.models';
import type { IMemoryProvider } from '../providers/memory.provider';

/**
 * Long-term Memory — preferences and persistent AI experiences across sessions.
 */
@Injectable()
export class LongTermMemory implements ILongTermMemory {
  constructor(@Inject(MEMORY_PROVIDER) private readonly provider: IMemoryProvider) {}

  async store(record: MemoryRecord): Promise<MemoryRecord> {
    if (record.kind !== 'long_term') {
      throw new Error('LongTermMemory only stores long_term kind');
    }
    return this.provider.save(record);
  }

  async recall(query: MemoryQueryDto): Promise<MemoryCollection> {
    return this.provider.findMany({
      kind: 'long_term',
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
