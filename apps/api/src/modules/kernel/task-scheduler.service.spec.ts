import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetConfigCache } from '@ai-tos/config';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { MemoryTaskStore } from './storage/memory-task.store';
import { TaskSchedulerService } from './task-scheduler.service';

describe('TaskSchedulerService', () => {
  let scheduler: TaskSchedulerService;
  let events: string[];

  beforeEach(() => {
    resetConfigCache();
    process.env.KERNEL_SCHEDULER_MAX_CONCURRENCY = '1';
    process.env.KERNEL_SCHEDULER_RETRY_BACKOFF_MS = '30';
    process.env.KERNEL_SCHEDULER_ENABLED = 'true';

    const config = new ConfigService();
    const bus = new EventBusService(config);
    bus.clear();
    events = [];
    bus.subscribe('kernel.#', (e) => {
      events.push(e.topic);
    });
    scheduler = new TaskSchedulerService(config, bus, new MemoryTaskStore());
    scheduler.resetForTests();
  });

  afterEach(() => {
    scheduler.onModuleDestroy();
    delete process.env.KERNEL_SCHEDULER_MAX_CONCURRENCY;
    delete process.env.KERNEL_SCHEDULER_RETRY_BACKOFF_MS;
    delete process.env.KERNEL_SCHEDULER_ENABLED;
    resetConfigCache();
  });

  it('creates tasks with unique ids and pending state', () => {
    const a = scheduler.createTask({ type: 'demo.job', payload: { n: 1 } });
    const b = scheduler.createTask({ type: 'demo.job', payload: { n: 2 } });
    assert.notEqual(a.id, b.id);
    assert.equal(a.state, 'pending');
    assert.ok(events.includes('kernel.task.created'));
  });

  it('runs FIFO when priorities are equal', async () => {
    const order: number[] = [];
    scheduler.registerHandler('fifo.job', async ({ task }) => {
      order.push((task.payload as { n: number }).n);
    });
    scheduler.createTask({ type: 'fifo.job', payload: { n: 1 }, priority: 0 });
    scheduler.createTask({ type: 'fifo.job', payload: { n: 2 }, priority: 0 });
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 20));
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 20));
    assert.deepEqual(order, [1, 2]);
  });

  it('runs higher priority first', async () => {
    const order: string[] = [];
    scheduler.registerHandler('prio.job', async ({ task }) => {
      order.push((task.payload as { id: string }).id);
    });
    scheduler.createTask({ type: 'prio.job', payload: { id: 'low' }, priority: 1 });
    scheduler.createTask({ type: 'prio.job', payload: { id: 'high' }, priority: 10 });
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 20));
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 20));
    assert.deepEqual(order, ['high', 'low']);
  });

  it('supports delayed tasks', async () => {
    let ran = false;
    scheduler.registerHandler('delay.job', async () => {
      ran = true;
    });
    const task = scheduler.createTask({ type: 'delay.job', delayMs: 60 });
    assert.equal(task.state, 'scheduled');
    await scheduler.tick();
    assert.equal(ran, false);
    await new Promise((r) => setTimeout(r, 80));
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(ran, true);
    assert.equal(scheduler.getTask(task.id)?.state, 'completed');
  });

  it('retries failed tasks then fails', async () => {
    let attempts = 0;
    scheduler.registerHandler('retry.job', async () => {
      attempts += 1;
      throw new Error('boom');
    });
    const task = scheduler.createTask({
      type: 'retry.job',
      maxRetries: 1,
    });
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(scheduler.getTask(task.id)?.state, 'scheduled');
    await new Promise((r) => setTimeout(r, 50));
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(attempts, 2);
    assert.equal(scheduler.getTask(task.id)?.state, 'failed');
    assert.ok(events.includes('kernel.task.retry_scheduled'));
    assert.ok(events.includes('kernel.task.failed'));
  });

  it('cancels pending tasks', () => {
    const task = scheduler.createTask({ type: 'cancel.job' });
    assert.equal(scheduler.cancelTask(task.id), true);
    assert.equal(scheduler.getTask(task.id)?.state, 'cancelled');
    assert.ok(events.includes('kernel.task.cancelled'));
  });

  it('times out long-running tasks', async () => {
    scheduler.registerHandler('timeout.job', async ({ signal }) => {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 500);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('aborted'));
        });
      });
    });
    const task = scheduler.createTask({ type: 'timeout.job', timeoutMs: 30, maxRetries: 0 });
    await scheduler.tick();
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(scheduler.getTask(task.id)?.state, 'failed');
    assert.match(scheduler.getTask(task.id)?.error ?? '', /timed out|aborted/);
  });
});
