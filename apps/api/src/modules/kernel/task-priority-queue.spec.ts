import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TaskPriorityQueue } from './task-priority-queue';
import type { KernelTask } from './task.types';

function task(partial: Partial<KernelTask> & Pick<KernelTask, 'id' | 'priority' | 'sequence'>): KernelTask {
  return {
    type: 'demo',
    payload: {},
    state: 'pending',
    createdAt: new Date().toISOString(),
    scheduledFor: null,
    startedAt: null,
    completedAt: null,
    attempts: 0,
    maxRetries: 0,
    timeoutMs: 1000,
    ...partial,
  };
}

describe('TaskPriorityQueue', () => {
  it('orders by priority then FIFO sequence', () => {
    const q = new TaskPriorityQueue();
    q.enqueue(task({ id: 'a', priority: 1, sequence: 1 }));
    q.enqueue(task({ id: 'b', priority: 5, sequence: 2 }));
    q.enqueue(task({ id: 'c', priority: 5, sequence: 3 }));
    q.enqueue(task({ id: 'd', priority: 0, sequence: 4 }));
    assert.equal(q.dequeue()?.id, 'b');
    assert.equal(q.dequeue()?.id, 'c');
    assert.equal(q.dequeue()?.id, 'a');
    assert.equal(q.dequeue()?.id, 'd');
  });

  it('removes by id', () => {
    const q = new TaskPriorityQueue();
    q.enqueue(task({ id: 'x', priority: 1, sequence: 1 }));
    assert.equal(q.remove('x'), true);
    assert.equal(q.size, 0);
  });
});
