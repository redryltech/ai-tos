import type { CacheStore } from './cache.types';

interface MemoryEntry {
  value: string;
  expiresAt: number | null;
}

/**
 * In-process memory cache with TTL and max entry eviction (FIFO on overflow).
 */
export class MemoryCacheStore implements CacheStore {
  readonly driver = 'memory';
  private readonly store = new Map<string, MemoryEntry>();

  constructor(private readonly maxEntries: number) {}

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt != null && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldest = this.store.keys().next().value as string | undefined;
      if (oldest != null) this.store.delete(oldest);
    }
    const expiresAt =
      ttlSeconds != null && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async invalidatePrefix(prefix: string): Promise<number> {
    let count = 0;
    for (const key of [...this.store.keys()]) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count += 1;
      }
    }
    return count;
  }

  async size(): Promise<number> {
    this.purgeExpired();
    return this.store.size;
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt != null && entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }
}
