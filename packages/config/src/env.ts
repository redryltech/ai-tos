/**
 * Flat environment schema + load/validate (Phase 0 + 2.1.1).
 * Prefer PlatformConfig / ConfigService for new modules.
 */

import { z } from 'zod';
import {
  requiresSecureSecrets,
  resolveDeployEnvironment,
  toPlatformConfig,
  type PlatformConfig,
} from './platform-config';

/** Known insecure placeholders — rejected in staging/production. */
export const INSECURE_SECRET_DEFAULTS = {
  JWT_SECRET: 'dev-insecure-change-me',
  JWT_REFRESH_SECRET: 'dev-insecure-refresh-change-me',
  API_KEY_ENCRYPTION_SECRET: 'dev-insecure-api-key-encryption-secret!!',
} as const;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** Deploy environment for the AI OS (supports staging beyond NODE_ENV). */
  APP_ENV: z.enum(['development', 'testing', 'staging', 'production']).optional(),
  APP_NAME: z.string().min(1).default('ai-tos'),
  APP_VERSION: z.string().min(1).default('0.0.0'),
  API_GLOBAL_PREFIX: z.string().default('api'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  /** Comma-separated transports: console,file */
  LOG_TRANSPORTS: z.string().default('console'),
  /** Required when `file` is listed in LOG_TRANSPORTS. */
  LOG_FILE_PATH: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url().default('postgresql://ai-tos:ai-tos@localhost:5432/ai_tos'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(16).default(INSECURE_SECRET_DEFAULTS.JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16).default(INSECURE_SECRET_DEFAULTS.JWT_REFRESH_SECRET),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  /** 32+ char secret for AES-256-GCM encryption of org API keys (Phase 1.5). */
  API_KEY_ENCRYPTION_SECRET: z
    .string()
    .min(32)
    .default(INSECURE_SECRET_DEFAULTS.API_KEY_ENCRYPTION_SECRET),
  AUTH_COOKIE_ACCESS_NAME: z.string().default('ai_tos_access'),
  AUTH_COOKIE_REFRESH_NAME: z.string().default('ai_tos_refresh'),
  AUTH_COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  AUTH_COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  AUTH_COOKIE_DOMAIN: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),

  // OpenTelemetry instrumentation baseline (Phase 0B.6) — optional; defaults keep local/dev working.
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default('http://localhost:4317'),
  OTEL_EXPORTER_OTLP_PROTOCOL: z.enum(['grpc', 'http/protobuf', 'http/json']).default('grpc'),
  OTEL_SERVICE_NAME: z.string().default('ai-tos'),
  OTEL_RESOURCE_ATTRIBUTES: z.string().default('deployment.environment=development'),
  OTEL_TRACES_EXPORTER: z.string().default('otlp'),
  OTEL_METRICS_EXPORTER: z.string().default('otlp'),
  OTEL_LOGS_EXPORTER: z.string().default('otlp'),
  METRICS_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  METRICS_PREFIX: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/, 'METRICS_PREFIX must be snake_case')
    .default('ai_tos'),

  HEALTH_TIMEOUT_MS: z.coerce.number().int().positive().default(2000),
  HEALTH_CHECK_DATABASE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  HEALTH_CHECK_REDIS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  HEALTH_CHECK_CACHE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  HEALTH_CHECK_AI_GATEWAY: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  HEALTH_CHECK_EVENT_BUS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  REDIS_CACHE_URL: z.string().url().default('redis://localhost:6379'),
  EVENT_BUS_URL: z.string().url().optional(),
  HEALTH_READINESS_REQUIRED: z.string().default('api,database,redis'),

  CACHE_DRIVER: z.enum(['memory', 'redis']).default('memory'),
  CACHE_TTL_SECONDS: z.coerce.number().int().nonnegative().default(300),
  CACHE_NAMESPACE: z
    .string()
    .regex(/^[a-z][a-z0-9_:-]*$/i, 'CACHE_NAMESPACE must be a safe key prefix')
    .default('ai_tos'),
  CACHE_MAX_MEMORY_ENTRIES: z.coerce.number().int().positive().default(10_000),

  EVENT_BUS_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  EVENT_BUS_DRIVER: z.enum(['memory']).default('memory'),
  EVENT_BUS_MAX_LISTENERS: z.coerce.number().int().positive().default(100),
  EVENT_BUS_DISPATCH: z.enum(['parallel', 'sequential']).default('parallel'),
});

export type AppConfig = z.infer<typeof envSchema>;

let cachedFlat: AppConfig | null = null;
let cachedPlatform: PlatformConfig | null = null;

/**
 * Fail fast in staging/production when secrets are missing, too short, or still
 * set to known insecure development placeholders. No-op in development/testing.
 */
export function assertSecureSecrets(config: AppConfig): void {
  const environment = resolveDeployEnvironment({
    APP_ENV: config.APP_ENV,
    NODE_ENV: config.NODE_ENV,
  });
  if (!requiresSecureSecrets(environment)) return;

  const failures: string[] = [];

  const checks: Array<{ name: keyof typeof INSECURE_SECRET_DEFAULTS; value: string; min: number }> =
    [
      { name: 'JWT_SECRET', value: config.JWT_SECRET, min: 32 },
      { name: 'JWT_REFRESH_SECRET', value: config.JWT_REFRESH_SECRET, min: 32 },
      { name: 'API_KEY_ENCRYPTION_SECRET', value: config.API_KEY_ENCRYPTION_SECRET, min: 32 },
    ];

  for (const check of checks) {
    const insecure = INSECURE_SECRET_DEFAULTS[check.name];
    if (!check.value || check.value === insecure) {
      failures.push(
        `${check.name} must be set to a unique secret (not the insecure development default).`,
      );
      continue;
    }
    if (check.value.length < check.min) {
      failures.push(
        `${check.name} must be at least ${check.min} characters in ${environment}.`,
      );
    }
    if (/change-?me|insecure|password|secret!!/i.test(check.value)) {
      failures.push(
        `${check.name} appears to be a placeholder/insecure value; set a strong ${environment} secret.`,
      );
    }
  }

  if (!config.DATABASE_URL) {
    failures.push('DATABASE_URL is required.');
  }
  if (!config.REDIS_URL) {
    failures.push('REDIS_URL is required.');
  }
  if (!config.AI_SERVICE_URL) {
    failures.push('AI_SERVICE_URL is required.');
  }

  if (failures.length > 0) {
    throw new Error(
      `Configuration validation failed (${environment}):\n- ${failures.join('\n- ')}\n` +
        `Refusing to start with incomplete or insecure configuration.`,
    );
  }
}

/** @deprecated Prefer assertSecureSecrets — kept for existing callers/tests. */
export function assertProductionSecrets(config: AppConfig): void {
  assertSecureSecrets(config);
}

/** Reset cached config (unit tests only). */
export function resetConfigCache(): void {
  cachedFlat = null;
  cachedPlatform = null;
}

/** Load and validate flat env config once. Throws on invalid env (fail-fast). */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  if (cachedFlat) return cachedFlat;
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  assertSecureSecrets(parsed.data);
  cachedFlat = parsed.data;
  return cachedFlat;
}

/** Load organized platform configuration (fail-fast on invalid/missing config). */
export function loadPlatformConfig(env: NodeJS.ProcessEnv = process.env): PlatformConfig {
  if (cachedPlatform) return cachedPlatform;
  const flat = loadConfig(env);
  cachedPlatform = toPlatformConfig(flat);
  return cachedPlatform;
}

export const config: AppConfig = loadConfig();
