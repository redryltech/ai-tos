/** Generic cache store contract (Phase 2.1.6). */

export interface CacheStatsSnapshot {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  invalidations: number;
  entries: number;
  driver: string;
}

export interface CacheStore {
  readonly driver: string;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<boolean>;
  /** Delete all keys with the given prefix. Returns deleted count. */
  invalidatePrefix(prefix: string): Promise<number>;
  size(): Promise<number>;
  close?(): Promise<void>;
}
