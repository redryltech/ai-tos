import { Inject, Injectable } from '@nestjs/common';
import type { ISessionMemory } from '../contracts/memory.contracts';
import { MEMORY_PROVIDER } from '../contracts/memory.contracts';
import type { MemoryQueryDto } from '../dto/memory.dto';
import type { MemoryCollection, MemoryRecord } from '../models/memory.models';
import type { IMemoryProvider } from '../providers/memory.provider';

/**
 * Session Memory — temporary conversation/workflow/execution context.
 * Destroyed after session expiry unless promoted via controller update.
 */
@Injectable()
export class SessionMemory implements ISessionMemory {
  constructor(@Inject(MEMORY_PROVIDER) private readonly provider: IMemoryProvider) {}

  async store(record: MemoryRecord): Promise<MemoryRecord> {
    if (record.kind !== 'session') {
      throw new Error('SessionMemory only stores session kind');
    }
    return this.provider.save(record);
  }

  async recall(query: MemoryQueryDto): Promise<MemoryCollection> {
    return this.provider.findMany({
      kind: 'session',
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
