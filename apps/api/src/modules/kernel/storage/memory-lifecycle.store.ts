import { Injectable } from '@nestjs/common';
import type { LifecyclePhase, LifecycleRecord } from '../lifecycle.types';
import type { ILifecycleStore } from './kernel-store.contracts';

@Injectable()
export class MemoryLifecycleStore implements ILifecycleStore {
  private readonly records = new Map<string, LifecycleRecord>();

  save(record: LifecycleRecord): void {
    this.records.set(record.id, record);
  }

  get(id: string): LifecycleRecord | undefined {
    return this.records.get(id);
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  values(): IterableIterator<LifecycleRecord> {
    return this.records.values();
  }

  list(phase?: LifecyclePhase): LifecycleRecord[] {
    const all = [...this.records.values()];
    return phase ? all.filter((r) => r.phase === phase) : all;
  }

  size(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
  }
}
