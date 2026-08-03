import { Socket } from 'node:net';
import { getPool } from '@ai-tos/database';

export interface CheckResult {
  ok: boolean;
  latencyMs: number;
  message?: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/** PostgreSQL liveness via SELECT 1. */
export async function checkDatabase(timeoutMs: number): Promise<CheckResult> {
  const started = Date.now();
  try {
    await withTimeout(getPool().query('SELECT 1'), timeoutMs, 'database');
    return { ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Redis PING over a raw TCP socket (no Redis client dependency).
 * Supports redis:// and rediss:// URLs (TLS not required for local ping TCP).
 */
export async function checkRedisUrl(url: string, timeoutMs: number): Promise<CheckResult> {
  const started = Date.now();
  try {
    await withTimeout(redisPing(url), timeoutMs, 'redis');
    return { ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

function redisPing(urlString: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      reject(new Error(`Invalid Redis URL`));
      return;
    }

    const host = parsed.hostname || '127.0.0.1';
    const port = Number(parsed.port || 6379);
    const socket = new Socket();
    let settled = false;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };

    const ok = () => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve();
    };

    socket.setTimeout(timeoutSafe(parsed));
    socket.once('error', (err) => fail(err));
    socket.once('timeout', () => fail(new Error('Redis socket timeout')));
    socket.connect(port, host, () => {
      socket.write('*1\r\n$4\r\nPING\r\n');
    });
    socket.on('data', (buf) => {
      const text = buf.toString('utf8');
      if (text.includes('+PONG') || text.includes('PONG')) {
        ok();
      } else if (text.startsWith('-')) {
        fail(new Error(`Redis error: ${text.trim()}`));
      }
    });
  });
}

function timeoutSafe(_url: URL): number {
  return 5_000;
}

/** HTTP reachability check for AI Gateway / Event Bus HTTP endpoints. */
export async function checkHttpEndpoint(
  baseUrl: string,
  timeoutMs: number,
  path = '/health',
): Promise<CheckResult> {
  const started = Date.now();
  const target = joinUrl(baseUrl, path);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(target, {
      method: 'GET',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) {
      return {
        ok: false,
        latencyMs: Date.now() - started,
        message: `HTTP ${res.status} from ${target}`,
      };
    }
    return { ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Generic TCP reachability for event bus brokers (host:port from URL). */
export async function checkTcpUrl(urlString: string, timeoutMs: number): Promise<CheckResult> {
  const started = Date.now();
  try {
    await withTimeout(tcpConnect(urlString), timeoutMs, 'tcp');
    return { ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

function tcpConnect(urlString: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      reject(new Error('Invalid URL'));
      return;
    }
    const host = parsed.hostname || '127.0.0.1';
    const port = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80));
    if (!port) {
      reject(new Error('URL missing port'));
      return;
    }
    const socket = new Socket();
    let settled = false;
    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (err) reject(err);
      else resolve();
    };
    socket.setTimeout(5_000);
    socket.once('connect', () => done());
    socket.once('error', (err) => done(err));
    socket.once('timeout', () => done(new Error('TCP timeout')));
    socket.connect(port, host);
  });
}

function joinUrl(base: string, path: string): string {
  const trimmed = base.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${trimmed}${suffix}`;
}

/** Aggregate overall status from component results. */
export function aggregateStatus(
  components: Array<{ status: 'ok' | 'degraded' | 'error' | 'skipped' }>,
): 'ok' | 'degraded' | 'error' {
  const active = components.filter((c) => c.status !== 'skipped');
  if (active.some((c) => c.status === 'error')) {
    return active.every((c) => c.status === 'error') ? 'error' : 'degraded';
  }
  if (active.some((c) => c.status === 'degraded')) return 'degraded';
  return 'ok';
}
