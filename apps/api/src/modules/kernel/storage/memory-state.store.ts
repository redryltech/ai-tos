import { Injectable } from '@nestjs/common';
import type { ExecutionRecord, ExecutionState } from '../execution-state.types';
import type { IStateStore } from './kernel-store.contracts';

@Injectable()
export class MemoryStateStore implements IStateStore {
  private readonly records = new Map<string, ExecutionRecord>();

  save(record: ExecutionRecord): void {
    this.records.set(record.id, record);
  }

  get(id: string): ExecutionRecord | undefined {
    return this.records.get(id);
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  values(): IterableIterator<ExecutionRecord> {
    return this.records.values();
  }

  list(state?: ExecutionState): ExecutionRecord[] {
    const all = [...this.records.values()];
    return state ? all.filter((r) => r.state === state) : all;
  }

  size(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
  }
}
