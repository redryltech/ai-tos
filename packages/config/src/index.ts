/**
 * @ai-tos/config — validated environment configuration.
 * Single source of truth for env vars across all Node services.
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url().default('postgresql://ai-tos:ai-tos@localhost:5432/ai_tos'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(16).default('dev-insecure-change-me'),
  JWT_EXPIRES_IN: z.string().default('15m'),
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
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | null = null;

/** Load and validate config once. Throws on invalid env (fail-fast). */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  if (cached) return cached;
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

export const config: AppConfig = loadConfig();
export {};
