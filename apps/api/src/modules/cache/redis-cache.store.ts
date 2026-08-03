import { Socket } from 'node:net';
import type { CacheStore } from './cache.types';

/**
 * Minimal Redis cache store over RESP (GET/SET/DEL/SCAN/TTL).
 * Avoids an extra client dependency while remaining Prometheus/ops compatible.
 */
export class RedisCacheStore implements CacheStore {
  readonly driver = 'redis';
  private readonly url: string;

  constructor(redisUrl: string) {
    this.url = redisUrl;
  }

  async get(key: string): Promise<string | null> {
    const res = await this.command(['GET', key]);
    if (res == null) return null;
    return String(res);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds != null && ttlSeconds > 0) {
      await this.command(['SET', key, value, 'EX', String(ttlSeconds)]);
    } else {
      await this.command(['SET', key, value]);
    }
  }

  async del(key: string): Promise<boolean> {
    const res = await this.command(['DEL', key]);
    return Number(res) > 0;
  }

  async invalidatePrefix(prefix: string): Promise<number> {
    let cursor = '0';
    let deleted = 0;
    do {
      const result = (await this.command(['SCAN', cursor, 'MATCH', `${prefix}*`, 'COUNT', '100'])) as [
        string,
        string[],
      ];
      cursor = String(result[0]);
      const keys = result[1] ?? [];
      if (keys.length > 0) {
        const n = await this.command(['DEL', ...keys]);
        deleted += Number(n);
      }
    } while (cursor !== '0');
    return deleted;
  }

  async size(): Promise<number> {
    const res = await this.command(['DBSIZE']);
    return Number(res);
  }

  private command(args: string[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      let parsed: URL;
      try {
        parsed = new URL(this.url);
      } catch {
        reject(new Error('Invalid Redis URL'));
        return;
      }

      const host = parsed.hostname || '127.0.0.1';
      const port = Number(parsed.port || 6379);
      const socket = new Socket();
      let buffer: Buffer = Buffer.alloc(0);
      let settled = false;

      const fail = (err: Error) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        reject(err);
      };

      const ok = (value: unknown) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(value);
      };

      socket.setTimeout(5_000);
      socket.once('error', (err) => fail(err));
      socket.once('timeout', () => fail(new Error('Redis command timeout')));
      socket.connect(port, host, () => {
        socket.write(encodeResp(args));
      });
      socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk] as Buffer[]);
        try {
          const { value, rest } = decodeResp(buffer);
          if (rest !== null) {
            buffer = Buffer.from(rest);
            if (value instanceof Error) fail(value);
            else ok(value);
          }
        } catch (err) {
          fail(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
  }
}

function encodeResp(args: string[]): string {
  let out = `*${args.length}\r\n`;
  for (const arg of args) {
    const payload = Buffer.from(arg, 'utf8');
    out += `$${payload.length}\r\n${arg}\r\n`;
  }
  return out;
}

function decodeResp(buf: Buffer): { value: unknown; rest: Buffer | null } {
  if (buf.length === 0) return { value: null, rest: null };
  const type = String.fromCharCode(buf[0]);
  if (type === '+') {
    const end = buf.indexOf('\r\n');
    if (end < 0) return { value: null, rest: null };
    return { value: buf.subarray(1, end).toString('utf8'), rest: Buffer.from(buf.subarray(end + 2)) };
  }
  if (type === '-') {
    const end = buf.indexOf('\r\n');
    if (end < 0) return { value: null, rest: null };
    return {
      value: new Error(buf.subarray(1, end).toString('utf8')),
      rest: Buffer.from(buf.subarray(end + 2)),
    };
  }
  if (type === ':') {
    const end = buf.indexOf('\r\n');
    if (end < 0) return { value: null, rest: null };
    return {
      value: Number(buf.subarray(1, end).toString('utf8')),
      rest: Buffer.from(buf.subarray(end + 2)),
    };
  }
  if (type === '$') {
    const headerEnd = buf.indexOf('\r\n');
    if (headerEnd < 0) return { value: null, rest: null };
    const len = Number(buf.subarray(1, headerEnd).toString('utf8'));
    if (len === -1) return { value: null, rest: Buffer.from(buf.subarray(headerEnd + 2)) };
    const start = headerEnd + 2;
    const end = start + len;
    if (buf.length < end + 2) return { value: null, rest: null };
    return {
      value: buf.subarray(start, end).toString('utf8'),
      rest: Buffer.from(buf.subarray(end + 2)),
    };
  }
  if (type === '*') {
    const headerEnd = buf.indexOf('\r\n');
    if (headerEnd < 0) return { value: null, rest: null };
    const count = Number(buf.subarray(1, headerEnd).toString('utf8'));
    let rest: Buffer = Buffer.from(buf.subarray(headerEnd + 2));
    const items: unknown[] = [];
    for (let i = 0; i < count; i += 1) {
      const decoded = decodeResp(rest);
      if (decoded.rest === null) return { value: null, rest: null };
      items.push(decoded.value);
      rest = decoded.rest;
    }
    return { value: items, rest };
  }
  throw new Error(`Unsupported RESP type: ${type}`);
}
