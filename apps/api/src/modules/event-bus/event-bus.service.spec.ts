import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let bus: EventBusService;

  beforeEach(() => {
    bus = new EventBusService(new ConfigService());
    bus.clear();
  });

  it('publishes typed events to exact subscribers', async () => {
    const seen: unknown[] = [];
    bus.subscribe<{ id: string }>('ai.request.completed', (event) => {
      seen.push(event.payload);
    });

    const published = await bus.publish('ai.request.completed', { id: 'r1' });
    assert.equal(published.topic, 'ai.request.completed');
    assert.deepEqual(seen, [{ id: 'r1' }]);
  });

  it('routes via wildcard patterns', async () => {
    const topics: string[] = [];
    bus.subscribe('worker.#', (event) => {
      topics.push(event.topic);
    });
    await bus.publish('worker.task.started', { n: 1 });
    await bus.publish('worker.task.finished', { n: 2 });
    await bus.publish('ai.request.completed', { n: 3 });
    assert.deepEqual(topics, ['worker.task.started', 'worker.task.finished']);
  });

  it('unsubscribes handlers', async () => {
    let count = 0;
    const sub = bus.subscribe('system.ping', () => {
      count += 1;
    });
    await bus.publish('system.ping', {});
    assert.equal(bus.unsubscribe(sub.id), true);
    await bus.publish('system.ping', {});
    assert.equal(count, 1);
  });

  it('supports async handlers', async () => {
    const order: string[] = [];
    bus.subscribe('execution.order.test', async () => {
      await new Promise((r) => setTimeout(r, 20));
      order.push('done');
    });
    await bus.publish('execution.order.test', {});
    assert.deepEqual(order, ['done']);
  });

  it('tracks publish statistics', async () => {
    bus.subscribe('cognitive.signal.x', () => undefined);
    await bus.publish('cognitive.signal.x', { ok: true });
    const stats = bus.getStats();
    assert.equal(stats.enabled, true);
    assert.equal(stats.driver, 'memory');
    assert.ok(stats.published >= 1);
    assert.ok(stats.delivered >= 1);
  });

  it('publishAsync does not throw for valid topics', () => {
    assert.doesNotThrow(() => bus.publishAsync('kernel.job.queued', { jobId: 'j1' }));
  });
});
