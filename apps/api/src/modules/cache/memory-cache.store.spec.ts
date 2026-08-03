import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MemoryCacheStore } from './memory-cache.store';

describe('MemoryCacheStore', () => {
  let store: MemoryCacheStore;

  beforeEach(() => {
    store = new MemoryCacheStore(100);
  });

  it('sets and gets values', async () => {
    await store.set('a', '1');
    assert.equal(await store.get('a'), '1');
  });

  it('expires entries by TTL', async () => {
    await store.set('tmp', 'x', 1);
    assert.equal(await store.get('tmp'), 'x');
    await new Promise((r) => setTimeout(r, 1100));
    assert.equal(await store.get('tmp'), null);
  });

  it('invalidates by prefix', async () => {
    await store.set('ns:a', '1');
    await store.set('ns:b', '2');
    await store.set('other', '3');
    const n = await store.invalidatePrefix('ns:');
    assert.equal(n, 2);
    assert.equal(await store.get('other'), '3');
  });

  it('evicts oldest when max entries exceeded', async () => {
    const small = new MemoryCacheStore(2);
    await small.set('1', 'a');
    await small.set('2', 'b');
    await small.set('3', 'c');
    assert.equal(await small.get('1'), null);
    assert.equal(await small.get('2'), 'b');
    assert.equal(await small.get('3'), 'c');
  });
});
