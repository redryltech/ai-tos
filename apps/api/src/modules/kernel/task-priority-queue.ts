import type { KernelTask } from './task.types';

/**
 * Priority + FIFO queue for runnable tasks.
 * Higher priority first; ties broken by ascending sequence (FIFO).
 */
export class TaskPriorityQueue {
  private readonly items: KernelTask[] = [];

  enqueue(task: KernelTask): void {
    this.items.push(task);
    this.items.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.sequence - b.sequence;
    });
  }

  dequeue(): KernelTask | undefined {
    return this.items.shift();
  }

  remove(taskId: string): boolean {
    const idx = this.items.findIndex((t) => t.id === taskId);
    if (idx < 0) return false;
    this.items.splice(idx, 1);
    return true;
  }

  peek(): KernelTask | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }

  toArray(): KernelTask[] {
    return [...this.items];
  }

  clear(): void {
    this.items.length = 0;
  }
}
