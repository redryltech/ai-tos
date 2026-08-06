import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { ResourceManagerService } from './resource-manager.service';
import { MemoryResourceStore } from './storage/memory-resource.store';

describe('ResourceManagerService', () => {
  let rm: ResourceManagerService;
  let events: string[];

  beforeEach(() => {
    const config = new ConfigService();
    const bus = new EventBusService(config);
    bus.clear();
    events = [];
    bus.subscribe('kernel.resource.#', (e) => {
      events.push(e.topic);
    });
    rm = new ResourceManagerService(config, bus, new MemoryResourceStore());
    rm.clear();
  });

  it('exposes limits from ConfigService', () => {
    const limits = rm.getLimits();
    assert.ok(limits.maxWorkers > 0);
    assert.ok(limits.maxModelSlots > 0);
    assert.ok(limits.maxMemoryMb > 0);
    assert.ok(limits.maxConcurrency > 0);
  });

  it('reserves workers, memory, and concurrency', () => {
    const reservation = rm.reserve({
      ownerId: 'job-1',
      workers: 2,
      memoryMb: 256,
      concurrency: 2,
    });
    assert.equal(reservation.workers, 2);
    assert.equal(rm.getUsage().workers, 2);
    assert.equal(rm.getAvailable().workers, rm.getLimits().maxWorkers - 2);
    assert.ok(events.includes('kernel.resource.reserved'));
  });

  it('allocates workers and AI model slots', () => {
    const worker = rm.allocateWorker('owner-a');
    assert.ok(worker.workerId.length > 0);
    assert.equal(rm.getUsage().workers, 1);

    const model = rm.allocateModel('owner-a', 'gpt-test', 2);
    assert.equal(model.modelId, 'gpt-test');
    assert.equal(model.slots, 2);
    assert.equal(rm.getUsage().modelSlots, 2);
  });

  it('enforces capacity limits', () => {
    const limits = rm.getLimits();
    rm.reserve({ ownerId: 'fill', workers: limits.maxWorkers });
    assert.throws(
      () => rm.reserve({ ownerId: 'overflow', workers: 1 }),
      /Worker capacity exceeded/,
    );
    assert.equal(rm.tryReserve({ ownerId: 'overflow', workers: 1 }), null);
  });

  it('enforces memory and concurrency limits', () => {
    const limits = rm.getLimits();
    assert.throws(
      () => rm.reserve({ ownerId: 'm', memoryMb: limits.maxMemoryMb + 1 }),
      /Memory limit exceeded/,
    );
    rm.reserve({ ownerId: 'c', concurrency: limits.maxConcurrency });
    assert.throws(
      () => rm.reserve({ ownerId: 'c2', concurrency: 1 }),
      /Concurrency limit exceeded/,
    );
  });

  it('releases reservations and restores capacity', () => {
    const r = rm.reserve({ ownerId: 'o', workers: 1, modelSlots: 1, memoryMb: 64 });
    assert.equal(rm.release(r.id), true);
    assert.equal(rm.getUsage().workers, 0);
    assert.equal(rm.getUsage().modelSlots, 0);
    assert.ok(events.includes('kernel.resource.released'));
  });

  it('reports stats and lists by owner', () => {
    rm.allocateWorker('a');
    rm.allocateModel('b', 'model-x');
    assert.equal(rm.listReservations('a').length, 1);
    assert.equal(rm.stats().activeReservations, 2);
    assert.equal(rm.releaseAll('a'), 1);
    assert.equal(rm.stats().activeReservations, 1);
  });
});
