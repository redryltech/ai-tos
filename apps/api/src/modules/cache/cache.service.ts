import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import type { CacheStatsSnapshot, CacheStore } from './cache.types';
import { MemoryCacheStore } from './memory-cache.store';
import { RedisCacheStore } from './redis-cache.store';

export interface CacheSetOptions {
  /** Override default TTL (seconds). 0 = no expiry. */
  ttlSeconds?: number;
  /** Logical namespace (combined with global CACHE_NAMESPACE). */
  namespace?: string;
}

/**
 * Centralized cache facade (Phase 2.1.6).
 * Memory or Redis store · TTL · namespaces · invalidation · statistics.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly store: CacheStore;
  private readonly rootNamespace: string;
  private readonly defaultTtlSeconds: number;
  private hits = 0;
  private misses = 0;
  private sets = 0;
  private deletes = 0;
  private invalidations = 0;

  constructor(private readonly config: ConfigService) {
    const cfg = config.cache;
    this.rootNamespace = cfg.namespace;
    this.defaultTtlSeconds = cfg.defaultTtlSeconds;
    this.store =
      cfg.driver === 'redis'
        ? new RedisCacheStore(cfg.redisUrl)
        : new MemoryCacheStore(cfg.maxMemoryEntries);
  }

  get driver(): string {
    return this.store.driver;
  }

  async get<T = unknown>(key: string, namespace?: string): Promise<T | null> {
    const fullKey = this.buildKey(key, namespace);
    const raw = await this.store.get(fullKey);
    if (raw == null) {
      this.misses += 1;
      return null;
    }
    this.hits += 1;
    return this.deserialize<T>(raw);
  }

  async set<T>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    const fullKey = this.buildKey(key, options.namespace);
    const ttl =
      options.ttlSeconds !== undefined ? options.ttlSeconds : this.defaultTtlSeconds;
    await this.store.set(fullKey, this.serialize(value), ttl);
    this.sets += 1;
  }

  async delete(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    const removed = await this.store.del(fullKey);
    if (removed) this.deletes += 1;
    return removed;
  }

  /** Invalidate one key. */
  async invalidateKey(key: string, namespace?: string): Promise<boolean> {
    return this.delete(key, namespace);
  }

  /** Invalidate an entire logical namespace under the root prefix. */
  async invalidateNamespace(namespace: string): Promise<number> {
    const prefix = `${this.buildKey('', namespace)}:`;
    const count = await this.store.invalidatePrefix(prefix);
    this.invalidations += count;
    return count;
  }

  /** Invalidate everything under the configured root namespace. */
  async invalidateAll(): Promise<number> {
    const count = await this.store.invalidatePrefix(`${this.rootNamespace}:`);
    this.invalidations += count;
    return count;
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheSetOptions = {},
  ): Promise<T> {
    const cached = await this.get<T>(key, options.namespace);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async getStats(): Promise<CacheStatsSnapshot> {
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      deletes: this.deletes,
      invalidations: this.invalidations,
      entries: await this.store.size(),
      driver: this.store.driver,
    };
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.invalidations = 0;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.store.close) {
      await this.store.close();
    }
  }

  private buildKey(key: string, namespace?: string): string {
    const parts = [this.rootNamespace];
    if (namespace && namespace.length > 0) parts.push(namespace);
    if (key.length > 0) parts.push(key);
    return parts.join(':');
  }

  private serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  private deserialize<T>(raw: string): T {
    return JSON.parse(raw) as T;
  }
}
