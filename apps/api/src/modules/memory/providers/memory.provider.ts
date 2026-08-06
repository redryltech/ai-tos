import type {
  MemoryCollection,
  MemoryKind,
  MemoryRecord,
  MemoryStatus,
} from '../models/memory.models';

/** Storage-independent Memory Provider contract. */
export interface MemoryProviderFilter {
  readonly kind?: MemoryKind;
  readonly status?: MemoryStatus | readonly MemoryStatus[];
  readonly userId?: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly tags?: readonly string[];
  readonly text?: string;
  readonly limit?: number;
}

export interface IMemoryProvider {
  readonly driver: string;
  save(record: MemoryRecord): Promise<MemoryRecord>;
  findById(id: string): Promise<MemoryRecord | null>;
  findMany(filter: MemoryProviderFilter): Promise<MemoryCollection>;
  delete(id: string): Promise<boolean>;
  clear?(): Promise<void>;
}
