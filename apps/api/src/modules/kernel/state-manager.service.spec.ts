import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { canTransition } from './execution-state.types';
import { StateManagerService } from './state-manager.service';
import { MemoryStateStore } from './storage/memory-state.store';

describe('execution-state transitions', () => {
  it('allows pending → scheduled/running/cancelled', () => {
    assert.equal(canTransition('pending', 'scheduled'), true);
    assert.equal(canTransition('pending', 'running'), true);
    assert.equal(canTransition('pending', 'waiting'), false);
  });

  it('allows running → waiting/completed/failed/cancelled', () => {
    assert.equal(canTransition('running', 'waiting'), true);
    assert.equal(canTransition('running', 'completed'), true);
    assert.equal(canTransition('completed', 'running'), false);
  });
});

describe('StateManagerService', () => {
  let sm: StateManagerService;
  let events: string[];

  beforeEach(() => {
    const config = new ConfigService();
    const bus = new EventBusService(config);
    bus.clear();
    events = [];
    bus.subscribe('kernel.state.#', (e) => {
      events.push(e.topic);
    });
    sm = new StateManagerService(config, bus, new MemoryStateStore());
  });

  it('creates and tracks pending executions', () => {
    const exec = sm.create({ type: 'pipeline.run', correlationId: 'c-1' });
    assert.equal(exec.state, 'pending');
    assert.ok(exec.id.length > 0);
    assert.equal(sm.get(exec.id)?.type, 'pipeline.run');
    assert.ok(events.includes('kernel.state.created'));
  });

  it('supports full lifecycle including waiting', () => {
    const { id } = sm.create({ type: 'worker.job' });
    sm.schedule(id);
    sm.start(id);
    sm.wait(id, { reason: 'external-api' });
    sm.start(id);
    const done = sm.complete(id, { result: { ok: true } });

    assert.equal(done.state, 'completed');
    assert.deepEqual(done.result, { ok: true });
    assert.ok(done.startedAt);
    assert.ok(done.completedAt);
    assert.ok(done.history.length >= 5);
    assert.ok(events.includes('kernel.state.transitioned'));
  });

  it('rejects invalid transitions and terminal changes', () => {
    const { id } = sm.create({ type: 'x' });
    sm.start(id);
    assert.throws(() => sm.schedule(id), /Invalid transition/);
    sm.complete(id);
    assert.throws(() => sm.fail(id), /terminal state/);
  });

  it('fails and cancels with reasons', () => {
    const a = sm.create({ type: 'a' });
    sm.start(a.id);
    const failed = sm.fail(a.id, { error: 'boom', reason: 'handler-error' });
    assert.equal(failed.state, 'failed');
    assert.equal(failed.error, 'boom');

    const b = sm.create({ type: 'b', initialState: 'scheduled' });
    const cancelled = sm.cancel(b.id, { reason: 'user' });
    assert.equal(cancelled.state, 'cancelled');
  });

  it('lists by state and reports stats', () => {
    sm.create({ type: 'p1' });
    const r = sm.create({ type: 'p2' });
    sm.start(r.id);

    assert.equal(sm.list('pending').length, 1);
    assert.equal(sm.list('running').length, 1);
    const stats = sm.stats();
    assert.equal(stats.total, 2);
    assert.equal(stats.pending, 1);
    assert.equal(stats.running, 1);
  });

  it('removes terminal records only', () => {
    const live = sm.create({ type: 'live' });
    assert.equal(sm.remove(live.id), false);
    sm.cancel(live.id);
    assert.equal(sm.remove(live.id), true);
    assert.equal(sm.get(live.id), undefined);
  });
});
