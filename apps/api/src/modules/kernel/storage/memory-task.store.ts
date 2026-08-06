import { Injectable } from '@nestjs/common';
import type { KernelTask, TaskState } from '../task.types';
import type { ITaskStore } from './kernel-store.contracts';

@Injectable()
export class MemoryTaskStore implements ITaskStore {
  private readonly tasks = new Map<string, KernelTask>();
  private sequence = 0;

  nextSequence(): number {
    this.sequence += 1;
    return this.sequence;
  }

  save(task: KernelTask): void {
    this.tasks.set(task.id, task);
  }

  get(id: string): KernelTask | undefined {
    return this.tasks.get(id);
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  values(): IterableIterator<KernelTask> {
    return this.tasks.values();
  }

  list(state?: TaskState): KernelTask[] {
    const all = [...this.tasks.values()];
    return state ? all.filter((t) => t.state === state) : all;
  }

  size(): number {
    return this.tasks.size;
  }

  clear(): void {
    this.tasks.clear();
    this.sequence = 0;
  }
}
