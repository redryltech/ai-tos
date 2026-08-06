import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { canLifecycleTransition } from './lifecycle.types';
import { LifecycleManagerService } from './lifecycle-manager.service';
import { MemoryLifecycleStore } from './storage/memory-lifecycle.store';

describe('lifecycle transitions', () => {
  it('allows created → running and running → paused', () => {
    assert.equal(canLifecycleTransition('created', 'running'), true);
    assert.equal(canLifecycleTransition('running', 'paused'), true);
    assert.equal(canLifecycleTransition('paused', 'running'), true);
    assert.equal(canLifecycleTransition('completed', 'running'), false);
  });
});

describe('LifecycleManagerService', () => {
  let lm: LifecycleManagerService;
  let events: string[];

  beforeEach(() => {
    const config = new ConfigService();
    const bus = new EventBusService(config);
    bus.clear();
    events = [];
    bus.subscribe('kernel.lifecycle.#', (e) => {
      events.push(e.topic);
    });
    lm = new LifecycleManagerService(config, bus, new MemoryLifecycleStore());
  });

  it('registers task and execution lifecycles', () => {
    const task = lm.register({ kind: 'task', type: 'analyze', correlationId: 'c1' });
    const exec = lm.register({ kind: 'execution', type: 'pipeline.run', refId: 'p1' });
    assert.equal(task.phase, 'created');
    assert.equal(exec.kind, 'execution');
    assert.ok(events.includes('kernel.lifecycle.registered'));
  });

  it('supports start, pause, resume, complete', () => {
    const { id } = lm.register({ kind: 'task', type: 'job' });
    lm.start(id);
    lm.pause(id, { reason: 'hold' });
    assert.equal(lm.get(id)?.phase, 'paused');
    lm.resume(id);
    const done = lm.complete(id, { result: { ok: true } });
    assert.equal(done.phase, 'completed');
    assert.deepEqual(done.result, { ok: true });
    assert.ok(done.startedAt);
    assert.ok(done.endedAt);
    assert.ok(events.includes('kernel.lifecycle.start'));
    assert.ok(events.includes('kernel.lifecycle.pause'));
    assert.ok(events.includes('kernel.lifecycle.resume'));
    assert.ok(events.includes('kernel.lifecycle.complete'));
  });

  it('supports stop and cancel', () => {
    const a = lm.register({ kind: 'execution', type: 'a' });
    lm.start(a.id);
    assert.equal(lm.stop(a.id).phase, 'stopped');
    assert.ok(events.includes('kernel.lifecycle.stop'));

    const b = lm.register({ kind: 'task', type: 'b' });
    assert.equal(lm.cancel(b.id, { reason: 'user' }).phase, 'cancelled');
    assert.ok(events.includes('kernel.lifecycle.cancel'));
  });

  it('rejects invalid actions and terminal changes', () => {
    const { id } = lm.register({ kind: 'task', type: 'x' });
    assert.throws(() => lm.pause(id), /Invalid lifecycle action/);
    lm.start(id);
    lm.complete(id);
    assert.throws(() => lm.resume(id), /terminal phase/);
  });

  it('lists by phase and reports stats', () => {
    lm.register({ kind: 'task', type: 'p1' });
    const r = lm.register({ kind: 'task', type: 'p2' });
    lm.start(r.id);
    assert.equal(lm.list('created').length, 1);
    assert.equal(lm.list('running').length, 1);
    const stats = lm.stats();
    assert.equal(stats.total, 2);
    assert.equal(stats.running, 1);
  });

  it('removes terminal records only', () => {
    const live = lm.register({ kind: 'task', type: 'live' });
    assert.equal(lm.remove(live.id), false);
    lm.cancel(live.id);
    assert.equal(lm.remove(live.id), true);
    assert.equal(lm.get(live.id), undefined);
  });
});
