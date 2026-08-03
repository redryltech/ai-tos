import { createHash, randomUUID } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { loadConfig } from '@ai-tos/config';

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function newJti(): string {
  return randomUUID();
}

export function authCookieOptions(maxAgeMs: number): CookieOptions {
  const cfg = loadConfig();
  return {
    httpOnly: true,
    secure: cfg.AUTH_COOKIE_SECURE || cfg.NODE_ENV === 'production',
    sameSite: cfg.AUTH_COOKIE_SAME_SITE,
    domain: cfg.AUTH_COOKIE_DOMAIN,
    path: '/api/auth',
    maxAge: maxAgeMs,
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessMaxAgeMs: number,
  refreshMaxAgeMs: number,
): void {
  const cfg = loadConfig();
  res.cookie(cfg.AUTH_COOKIE_ACCESS_NAME, accessToken, {
    ...authCookieOptions(accessMaxAgeMs),
    path: '/',
  });
  res.cookie(cfg.AUTH_COOKIE_REFRESH_NAME, refreshToken, authCookieOptions(refreshMaxAgeMs));
}

export function clearAuthCookies(res: Response): void {
  const cfg = loadConfig();
  const base = { ...authCookieOptions(0), maxAge: 0 };
  res.clearCookie(cfg.AUTH_COOKIE_ACCESS_NAME, { ...base, path: '/' });
  res.clearCookie(cfg.AUTH_COOKIE_REFRESH_NAME, base);
}

export function readCookie(req: Request, name: string): string | undefined {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.[name];
}

/** Parse durations like 15m / 7d into milliseconds. */
export function durationToMs(input: string): number {
  const m = /^(\d+)([smhd])$/.exec(input.trim());
  if (!m) return 15 * 60 * 1000;
  const n = Number(m[1]);
  switch (m[2]) {
    case 's':
      return n * 1000;
    case 'm':
      return n * 60 * 1000;
    case 'h':
      return n * 60 * 60 * 1000;
    case 'd':
      return n * 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
}
