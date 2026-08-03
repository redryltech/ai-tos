import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(async () => {
    cache = new CacheService(new ConfigService());
    await cache.invalidateAll();
    cache.resetStats();
  });

  it('uses memory driver by default from ConfigService', () => {
    assert.equal(cache.driver, 'memory');
  });

  it('stores and retrieves JSON values with namespace', async () => {
    await cache.set('user', { id: 1 }, { namespace: 'profiles' });
    const value = await cache.get<{ id: number }>('user', 'profiles');
    assert.deepEqual(value, { id: 1 });
  });

  it('tracks hit/miss statistics', async () => {
    await cache.set('k', 'v');
    assert.equal(await cache.get('k'), 'v');
    assert.equal(await cache.get('missing'), null);
    const stats = await cache.getStats();
    assert.equal(stats.hits, 1);
    assert.equal(stats.misses, 1);
    assert.equal(stats.sets, 1);
    assert.equal(stats.driver, 'memory');
  });

  it('invalidates namespace keys', async () => {
    await cache.set('a', 1, { namespace: 'jobs' });
    await cache.set('b', 2, { namespace: 'jobs' });
    await cache.set('c', 3, { namespace: 'other' });
    const removed = await cache.invalidateNamespace('jobs');
    assert.ok(removed >= 2);
    assert.equal(await cache.get('a', 'jobs'), null);
    assert.equal(await cache.get('c', 'other'), 3);
  });

  it('getOrSet populates on miss', async () => {
    let calls = 0;
    const v1 = await cache.getOrSet('computed', async () => {
      calls += 1;
      return 42;
    });
    const v2 = await cache.getOrSet('computed', async () => {
      calls += 1;
      return 99;
    });
    assert.equal(v1, 42);
    assert.equal(v2, 42);
    assert.equal(calls, 1);
  });

  it('deletes individual keys', async () => {
    await cache.set('x', 'y');
    assert.equal(await cache.delete('x'), true);
    assert.equal(await cache.get('x'), null);
  });
});
