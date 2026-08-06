import type {
  MemoryCollection,
  MemoryRecord,
  MemoryStatus,
} from '../models/memory.models';
import type { IMemoryProvider, MemoryProviderFilter } from './memory.provider';

/**
 * In-process Memory Provider — default backend.
 * No SQL/Redis/Mongo coupling; swap via IMemoryProvider.
 */
export class InMemoryMemoryProvider implements IMemoryProvider {
  readonly driver = 'memory';
  private readonly store = new Map<string, MemoryRecord>();

  constructor(private readonly maxEntries: number) {}

  async save(record: MemoryRecord): Promise<MemoryRecord> {
    if (this.store.size >= this.maxEntries && !this.store.has(record.id)) {
      const oldest = this.store.keys().next().value as string | undefined;
      if (oldest != null) this.store.delete(oldest);
    }
    const frozen = Object.freeze({ ...record }) as MemoryRecord;
    this.store.set(record.id, frozen);
    return frozen;
  }

  async findById(id: string): Promise<MemoryRecord | null> {
    const record = this.store.get(id);
    if (!record) return null;
    if (this.isExpired(record)) {
      this.store.delete(id);
      return null;
    }
    return record;
  }

  async findMany(filter: MemoryProviderFilter): Promise<MemoryCollection> {
    const statuses = this.normalizeStatuses(filter.status);
    const limit = filter.limit ?? 100;
    const text = filter.text?.trim().toLowerCase();
    const items: MemoryRecord[] = [];

    for (const record of this.store.values()) {
      if (this.isExpired(record)) {
        this.store.delete(record.id);
        continue;
      }
      if (filter.kind && record.kind !== filter.kind) continue;
      if (statuses && !statuses.includes(record.status)) continue;
      if (filter.userId && record.userId !== filter.userId) continue;
      if (filter.organizationId && record.organizationId !== filter.organizationId) {
        continue;
      }
      if (filter.sessionId && record.sessionId !== filter.sessionId) continue;
      if (filter.tags?.length) {
        const tagSet = new Set(record.tags);
        if (!filter.tags.every((t) => tagSet.has(t))) continue;
      }
      if (text) {
        const hay = `${record.content} ${record.summary} ${record.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(text)) continue;
      }
      items.push(record);
      if (items.length >= limit) break;
    }

    return Object.freeze({
      items: Object.freeze(items),
      total: items.length,
      querySummary: `memory_provider:${this.driver};matched=${items.length}`,
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  private isExpired(record: MemoryRecord): boolean {
    if (!record.expiresAt) return false;
    return Date.parse(record.expiresAt) <= Date.now();
  }

  private normalizeStatuses(
    status?: MemoryStatus | readonly MemoryStatus[],
  ): MemoryStatus[] {
    if (status == null) return ['active'];
    if (typeof status === 'string') return [status];
    return [...status];
  }
}
