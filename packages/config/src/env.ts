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

  KERNEL_SCHEDULER_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_SCHEDULER_TICK_MS: z.coerce.number().int().positive().default(50),
  KERNEL_SCHEDULER_MAX_CONCURRENCY: z.coerce.number().int().positive().default(4),
  KERNEL_SCHEDULER_DEFAULT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  KERNEL_SCHEDULER_DEFAULT_MAX_RETRIES: z.coerce.number().int().nonnegative().default(0),
  KERNEL_SCHEDULER_DEFAULT_PRIORITY: z.coerce.number().int().default(0),
  KERNEL_SCHEDULER_RETRY_BACKOFF_MS: z.coerce.number().int().nonnegative().default(1000),
  KERNEL_CONTEXT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_CONTEXT_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_STATE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_STATE_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_STATE_MAX_ENTRIES: z.coerce.number().int().positive().default(10_000),
  KERNEL_RESOURCE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_RESOURCE_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_RESOURCE_MAX_WORKERS: z.coerce.number().int().positive().default(8),
  KERNEL_RESOURCE_MAX_MODEL_SLOTS: z.coerce.number().int().positive().default(4),
  KERNEL_RESOURCE_MAX_MEMORY_MB: z.coerce.number().int().positive().default(2048),
  KERNEL_RESOURCE_MAX_CONCURRENCY: z.coerce.number().int().positive().default(16),
  KERNEL_LIFECYCLE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_LIFECYCLE_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_LIFECYCLE_MAX_ENTRIES: z.coerce.number().int().positive().default(10_000),
  KERNEL_COMM_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_COMM_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KERNEL_COMM_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  KERNEL_COMM_MAX_PENDING_REQUESTS: z.coerce.number().int().positive().default(1_000),
  PERCEPTION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  PERCEPTION_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  PERCEPTION_DEFAULT_LANGUAGE: z.string().min(2).max(16).default('en'),
  THINKING_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  THINKING_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  THINKING_MAX_CANDIDATES: z.coerce.number().int().positive().default(5),
  DECISION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  DECISION_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  DECISION_MIN_CONFIDENCE: z.coerce.number().min(0).max(1).default(0.45),
  DECISION_APPROVAL_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.7),
  PLANNING_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  PLANNING_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  PLANNING_MAX_TASKS: z.coerce.number().int().positive().default(12),
  OUTPUT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  OUTPUT_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  OUTPUT_DEFAULT_PRIORITY: z
    .enum(['low', 'normal', 'high', 'critical'])
    .default('normal'),
  MEMORY_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  MEMORY_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  MEMORY_PROVIDER: z.enum(['memory']).default('memory'),
  MEMORY_MAX_ENTRIES: z.coerce.number().int().positive().default(10_000),
  MEMORY_SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(3_600),
  MEMORY_LONG_TERM_TTL_SECONDS: z.coerce.number().int().nonnegative().default(0),
  MEMORY_EPISODIC_TTL_SECONDS: z.coerce.number().int().nonnegative().default(0),
  MEMORY_ARCHIVE_AFTER_DAYS: z.coerce.number().int().positive().default(90),
  KNOWLEDGE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KNOWLEDGE_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  KNOWLEDGE_PROVIDER: z.enum(['memory']).default('memory'),
  KNOWLEDGE_MAX_DOCUMENTS: z.coerce.number().int().positive().default(10_000),
  KNOWLEDGE_CHUNK_SIZE: z.coerce.number().int().positive().default(500),
  KNOWLEDGE_CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(50),
  KNOWLEDGE_DEFAULT_TOP_K: z.coerce.number().int().positive().default(10),
  KNOWLEDGE_SEARCH_MODE: z.enum(['keyword', 'semantic', 'hybrid', 'metadata']).default('hybrid'),
  CAPABILITY_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  CAPABILITY_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  CAPABILITY_DEFAULT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  CAPABILITY_MAX_PARALLEL: z.coerce.number().int().positive().default(4),
  CAPABILITY_FALLBACK_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  CAPABILITY_PREFERRED_TIER: z.enum(['local', 'cloud', 'enterprise']).default('local'),
  MODEL_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  MODEL_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  MODEL_DEFAULT_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  MODEL_STREAMING_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  MODEL_HEALTH_CHECK_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  MODEL_DEFAULT_PROVIDER: z.string().min(1).default('local'),
  MODEL_AUTH_MODE: z
    .enum(['api_key', 'oauth', 'jwt', 'managed_identity', 'certificate'])
    .default('api_key'),
  TOOL_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  TOOL_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  TOOL_DEFAULT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  TOOL_MAX_CONCURRENT: z.coerce.number().int().positive().default(8),
  TOOL_STREAMING_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  TOOL_REGISTRATION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  TOOL_ALLOW_SHELL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  INTEGRATION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  INTEGRATION_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  INTEGRATION_DEFAULT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  INTEGRATION_POOL_SIZE: z.coerce.number().int().positive().default(8),
  INTEGRATION_HEALTH_CHECK_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(30_000),
  INTEGRATION_DEFAULT_AUTH_MODE: z
    .enum(['api_key', 'oauth', 'oauth2', 'jwt', 'managed_identity', 'certificate', 'basic'])
    .default('api_key'),
  INTEGRATION_REGISTRATION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  POLICY_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  POLICY_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  POLICY_PROVIDER: z.enum(['memory']).default('memory'),
  POLICY_CONFLICT_STRATEGY: z
    .enum(['most_restrictive', 'highest_authority'])
    .default('most_restrictive'),
  POLICY_VERSION_RETENTION: z.coerce.number().int().positive().default(20),
  POLICY_REGISTRATION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  WORKFLOW_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  WORKFLOW_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  WORKFLOW_MAX_NODES: z.coerce.number().int().positive().default(500),
  WORKFLOW_ALLOW_EMPTY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  WORKFLOW_DEFAULT_STRATEGY: z
    .enum(['sequential', 'parallel', 'hybrid', 'conditional', 'fan_out', 'fan_in'])
    .default('hybrid'),
  TASK_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  TASK_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  TASK_MAX_TASKS: z.coerce.number().int().positive().default(500),
  TASK_ALLOW_EMPTY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  EXECUTION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  EXECUTION_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  EXECUTION_MAX_CONCURRENCY: z.coerce.number().int().positive().default(8),
  EXECUTION_TOKEN_BUDGET: z.coerce.number().int().positive().default(100000),
  EXECUTION_CPU_UNITS: z.coerce.number().int().positive().default(100),
  EXECUTION_MEMORY_MB: z.coerce.number().int().positive().default(2048),
  EXECUTION_GPU_UNITS: z.coerce.number().int().nonnegative().default(0),
  EXECUTION_RATE_LIMIT_PER_SEC: z.coerce.number().int().positive().default(50),
  EXECUTION_WORKER_PROVIDER: z.enum(['local', 'stub']).default('local'),
  RELIABILITY_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  RELIABILITY_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  RELIABILITY_MAX_RETRIES: z.coerce.number().int().nonnegative().default(3),
  RELIABILITY_RETRY_BACKOFF_MS: z.coerce.number().int().positive().default(500),
  RELIABILITY_EXECUTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(300000),
  RELIABILITY_HEARTBEAT_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(30000),
  RELIABILITY_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  RELIABILITY_CIRCUIT_FAILURE_THRESHOLD: z.coerce
    .number()
    .int()
    .positive()
    .default(5),
  RELIABILITY_CIRCUIT_RESET_MS: z.coerce.number().int().positive().default(15000),
  RELIABILITY_CHECKPOINT_PROVIDER: z.enum(['memory']).default('memory'),
  STREAMING_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  STREAMING_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  STREAMING_MAX_BUFFER_SIZE: z.coerce.number().int().positive().default(1000),
  STREAMING_MAX_SUBSCRIBERS: z.coerce.number().int().positive().default(100),
  STREAMING_BACKPRESSURE_HIGH_WATERMARK: z.coerce
    .number()
    .int()
    .positive()
    .default(800),
  STREAMING_BACKPRESSURE_LOW_WATERMARK: z.coerce
    .number()
    .int()
    .positive()
    .default(200),
  STREAMING_TRANSPORT_PROVIDER: z.enum(['memory', 'event_bus']).default('memory'),
  FINALIZATION_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  FINALIZATION_EMIT_EVENTS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  FINALIZATION_ALLOW_PARTIAL: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  FINALIZATION_REQUIRE_OUTPUTS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  FINALIZATION_SCHEMA_VERSION: z.string().min(1).default('1.0.0'),
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
