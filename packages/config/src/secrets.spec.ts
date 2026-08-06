import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertSecureSecrets,
  INSECURE_SECRET_DEFAULTS,
  loadConfig,
  loadPlatformConfig,
  resetConfigCache,
  resolveDeployEnvironment,
  toPlatformConfig,
  type AppConfig,
} from './index';

function baseConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    NODE_ENV: 'development',
    APP_NAME: 'ai-tos',
    APP_VERSION: '0.0.0',
    API_GLOBAL_PREFIX: 'api',
    LOG_LEVEL: 'info',
    LOG_TRANSPORTS: 'console',
    PORT: 4000,
    DATABASE_URL: 'postgresql://ai-tos:ai-tos@localhost:5432/ai_tos',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: INSECURE_SECRET_DEFAULTS.JWT_SECRET,
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_SECRET: INSECURE_SECRET_DEFAULTS.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: '7d',
    API_KEY_ENCRYPTION_SECRET: INSECURE_SECRET_DEFAULTS.API_KEY_ENCRYPTION_SECRET,
    AUTH_COOKIE_ACCESS_NAME: 'ai_tos_access',
    AUTH_COOKIE_REFRESH_NAME: 'ai_tos_refresh',
    AUTH_COOKIE_SECURE: false,
    AUTH_COOKIE_SAME_SITE: 'lax',
    CORS_ORIGIN: 'http://localhost:3000',
    AI_SERVICE_URL: 'http://localhost:8000',
    OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4317',
    OTEL_EXPORTER_OTLP_PROTOCOL: 'grpc',
    OTEL_SERVICE_NAME: 'ai-tos',
    OTEL_RESOURCE_ATTRIBUTES: 'deployment.environment=development',
    OTEL_TRACES_EXPORTER: 'otlp',
    OTEL_METRICS_EXPORTER: 'otlp',
    OTEL_LOGS_EXPORTER: 'otlp',
    METRICS_ENABLED: true,
    METRICS_PREFIX: 'ai_tos',
    HEALTH_TIMEOUT_MS: 2000,
    HEALTH_CHECK_DATABASE: true,
    HEALTH_CHECK_REDIS: true,
    HEALTH_CHECK_CACHE: true,
    HEALTH_CHECK_AI_GATEWAY: true,
    HEALTH_CHECK_EVENT_BUS: false,
    REDIS_CACHE_URL: 'redis://localhost:6379',
    HEALTH_READINESS_REQUIRED: 'api,database,redis',
    CACHE_DRIVER: 'memory',
    CACHE_TTL_SECONDS: 300,
    CACHE_NAMESPACE: 'ai_tos',
    CACHE_MAX_MEMORY_ENTRIES: 10_000,
    EVENT_BUS_ENABLED: true,
    EVENT_BUS_DRIVER: 'memory',
    EVENT_BUS_MAX_LISTENERS: 100,
    EVENT_BUS_DISPATCH: 'parallel',
    KERNEL_SCHEDULER_ENABLED: true,
    KERNEL_SCHEDULER_TICK_MS: 50,
    KERNEL_SCHEDULER_MAX_CONCURRENCY: 4,
    KERNEL_SCHEDULER_DEFAULT_TIMEOUT_MS: 30_000,
    KERNEL_SCHEDULER_DEFAULT_MAX_RETRIES: 0,
    KERNEL_SCHEDULER_DEFAULT_PRIORITY: 0,
    KERNEL_SCHEDULER_RETRY_BACKOFF_MS: 1000,
    KERNEL_CONTEXT_ENABLED: true,
    KERNEL_CONTEXT_EMIT_EVENTS: true,
    KERNEL_STATE_ENABLED: true,
    KERNEL_STATE_EMIT_EVENTS: true,
    KERNEL_STATE_MAX_ENTRIES: 10_000,
    KERNEL_RESOURCE_ENABLED: true,
    KERNEL_RESOURCE_EMIT_EVENTS: true,
    KERNEL_RESOURCE_MAX_WORKERS: 8,
    KERNEL_RESOURCE_MAX_MODEL_SLOTS: 4,
    KERNEL_RESOURCE_MAX_MEMORY_MB: 2048,
    KERNEL_RESOURCE_MAX_CONCURRENCY: 16,
    KERNEL_LIFECYCLE_ENABLED: true,
    KERNEL_LIFECYCLE_EMIT_EVENTS: true,
    KERNEL_LIFECYCLE_MAX_ENTRIES: 10_000,
    KERNEL_COMM_ENABLED: true,
    KERNEL_COMM_EMIT_EVENTS: true,
    KERNEL_COMM_REQUEST_TIMEOUT_MS: 30_000,
    KERNEL_COMM_MAX_PENDING_REQUESTS: 1_000,
    PERCEPTION_ENABLED: true,
    PERCEPTION_EMIT_EVENTS: true,
    PERCEPTION_DEFAULT_LANGUAGE: 'en',
    THINKING_ENABLED: true,
    THINKING_EMIT_EVENTS: true,
    THINKING_MAX_CANDIDATES: 5,
    DECISION_ENABLED: true,
    DECISION_EMIT_EVENTS: true,
    DECISION_MIN_CONFIDENCE: 0.45,
    DECISION_APPROVAL_CONFIDENCE_THRESHOLD: 0.7,
    PLANNING_ENABLED: true,
    PLANNING_EMIT_EVENTS: true,
    PLANNING_MAX_TASKS: 12,
    OUTPUT_ENABLED: true,
    OUTPUT_EMIT_EVENTS: true,
    OUTPUT_DEFAULT_PRIORITY: 'normal',
    MEMORY_ENABLED: true,
    MEMORY_EMIT_EVENTS: true,
    MEMORY_PROVIDER: 'memory',
    MEMORY_MAX_ENTRIES: 10_000,
    MEMORY_SESSION_TTL_SECONDS: 3_600,
    MEMORY_LONG_TERM_TTL_SECONDS: 0,
    MEMORY_EPISODIC_TTL_SECONDS: 0,
    MEMORY_ARCHIVE_AFTER_DAYS: 90,
    KNOWLEDGE_ENABLED: true,
    KNOWLEDGE_EMIT_EVENTS: true,
    KNOWLEDGE_PROVIDER: 'memory',
    KNOWLEDGE_MAX_DOCUMENTS: 10_000,
    KNOWLEDGE_CHUNK_SIZE: 500,
    KNOWLEDGE_CHUNK_OVERLAP: 50,
    KNOWLEDGE_DEFAULT_TOP_K: 10,
    KNOWLEDGE_SEARCH_MODE: 'hybrid',
    CAPABILITY_ENABLED: true,
    CAPABILITY_EMIT_EVENTS: true,
    CAPABILITY_DEFAULT_TIMEOUT_MS: 30_000,
    CAPABILITY_MAX_PARALLEL: 4,
    CAPABILITY_FALLBACK_ENABLED: true,
    CAPABILITY_PREFERRED_TIER: 'local',
    MODEL_ENABLED: true,
    MODEL_EMIT_EVENTS: true,
    MODEL_DEFAULT_TIMEOUT_MS: 60_000,
    MODEL_STREAMING_ENABLED: true,
    MODEL_HEALTH_CHECK_INTERVAL_MS: 30_000,
    MODEL_DEFAULT_PROVIDER: 'local',
    MODEL_AUTH_MODE: 'api_key',
    TOOL_ENABLED: true,
    TOOL_EMIT_EVENTS: true,
    TOOL_DEFAULT_TIMEOUT_MS: 30_000,
    TOOL_MAX_CONCURRENT: 8,
    TOOL_STREAMING_ENABLED: true,
    TOOL_REGISTRATION_ENABLED: true,
    TOOL_ALLOW_SHELL: false,
    INTEGRATION_ENABLED: true,
    INTEGRATION_EMIT_EVENTS: true,
    INTEGRATION_DEFAULT_TIMEOUT_MS: 30_000,
    INTEGRATION_POOL_SIZE: 8,
    INTEGRATION_HEALTH_CHECK_INTERVAL_MS: 30_000,
    INTEGRATION_DEFAULT_AUTH_MODE: 'api_key',
    INTEGRATION_REGISTRATION_ENABLED: true,
    POLICY_ENABLED: true,
    POLICY_EMIT_EVENTS: true,
    POLICY_PROVIDER: 'memory',
    POLICY_CONFLICT_STRATEGY: 'most_restrictive',
    POLICY_VERSION_RETENTION: 20,
    POLICY_REGISTRATION_ENABLED: true,
    WORKFLOW_ENABLED: true,
    WORKFLOW_EMIT_EVENTS: true,
    WORKFLOW_MAX_NODES: 500,
    WORKFLOW_ALLOW_EMPTY: false,
    WORKFLOW_DEFAULT_STRATEGY: 'hybrid',
    TASK_ENABLED: true,
    TASK_EMIT_EVENTS: true,
    TASK_MAX_TASKS: 500,
    TASK_ALLOW_EMPTY: false,
    EXECUTION_ENABLED: true,
    EXECUTION_EMIT_EVENTS: true,
    EXECUTION_MAX_CONCURRENCY: 8,
    EXECUTION_TOKEN_BUDGET: 100000,
    EXECUTION_CPU_UNITS: 100,
    EXECUTION_MEMORY_MB: 2048,
    EXECUTION_GPU_UNITS: 0,
    EXECUTION_RATE_LIMIT_PER_SEC: 50,
    EXECUTION_WORKER_PROVIDER: 'local',
    RELIABILITY_ENABLED: true,
    RELIABILITY_EMIT_EVENTS: true,
    RELIABILITY_MAX_RETRIES: 3,
    RELIABILITY_RETRY_BACKOFF_MS: 500,
    RELIABILITY_EXECUTION_TIMEOUT_MS: 300000,
    RELIABILITY_HEARTBEAT_TIMEOUT_MS: 30000,
    RELIABILITY_IDLE_TIMEOUT_MS: 60000,
    RELIABILITY_CIRCUIT_FAILURE_THRESHOLD: 5,
    RELIABILITY_CIRCUIT_RESET_MS: 15000,
    RELIABILITY_CHECKPOINT_PROVIDER: 'memory',
    STREAMING_ENABLED: true,
    STREAMING_EMIT_EVENTS: true,
    STREAMING_MAX_BUFFER_SIZE: 1000,
    STREAMING_MAX_SUBSCRIBERS: 100,
    STREAMING_BACKPRESSURE_HIGH_WATERMARK: 800,
    STREAMING_BACKPRESSURE_LOW_WATERMARK: 200,
    STREAMING_TRANSPORT_PROVIDER: 'memory',
    FINALIZATION_ENABLED: true,
    FINALIZATION_EMIT_EVENTS: true,
    FINALIZATION_ALLOW_PARTIAL: true,
    FINALIZATION_REQUIRE_OUTPUTS: false,
    FINALIZATION_SCHEMA_VERSION: '1.0.0',

    ...overrides,
  };
}

const strongSecrets = {
  JWT_SECRET: 'staging-jwt-secret-value-32chars-ok',
  JWT_REFRESH_SECRET: 'staging-refresh-secret-value-32ch',
  API_KEY_ENCRYPTION_SECRET: 'staging-api-key-encryption-ok-32c',
} as const;

describe('resolveDeployEnvironment', () => {
  it('prefers APP_ENV including staging', () => {
    assert.equal(resolveDeployEnvironment({ APP_ENV: 'staging', NODE_ENV: 'production' }), 'staging');
    assert.equal(resolveDeployEnvironment({ APP_ENV: 'testing' }), 'testing');
  });

  it('maps NODE_ENV when APP_ENV unset', () => {
    assert.equal(resolveDeployEnvironment({ NODE_ENV: 'test' }), 'testing');
    assert.equal(resolveDeployEnvironment({ NODE_ENV: 'production' }), 'production');
    assert.equal(resolveDeployEnvironment({ NODE_ENV: 'development' }), 'development');
  });
});

describe('assertSecureSecrets', () => {
  it('allows insecure defaults in development and testing', () => {
    assert.doesNotThrow(() => assertSecureSecrets(baseConfig({ NODE_ENV: 'development' })));
    assert.doesNotThrow(() =>
      assertSecureSecrets(baseConfig({ NODE_ENV: 'test', APP_ENV: 'testing' })),
    );
  });

  it('rejects insecure defaults in production and staging', () => {
    assert.throws(
      () => assertSecureSecrets(baseConfig({ NODE_ENV: 'production' })),
      /Configuration validation failed/,
    );
    assert.throws(
      () => assertSecureSecrets(baseConfig({ NODE_ENV: 'development', APP_ENV: 'staging' })),
      /Configuration validation failed \(staging\)/,
    );
  });

  it('accepts strong unique secrets in staging/production', () => {
    assert.doesNotThrow(() =>
      assertSecureSecrets(baseConfig({ NODE_ENV: 'production', ...strongSecrets })),
    );
    assert.doesNotThrow(() =>
      assertSecureSecrets(
        baseConfig({ NODE_ENV: 'production', APP_ENV: 'staging', ...strongSecrets }),
      ),
    );
  });
});

describe('toPlatformConfig', () => {
  it('organizes flat env into typed sections', () => {
    const platform = toPlatformConfig(baseConfig({ APP_ENV: 'development', PORT: 4100 }));
    assert.equal(platform.app.environment, 'development');
    assert.equal(platform.api.port, 4100);
    assert.equal(platform.database.url.includes('postgresql'), true);
    assert.equal(platform.redis.url.includes('redis'), true);
    assert.equal(platform.ai.serviceUrl.includes('8000'), true);
    assert.ok(platform.security.jwtSecret);
    assert.ok(platform.monitoring.otelServiceName);
  });
});

describe('loadConfig / loadPlatformConfig', () => {
  beforeEach(() => {
    resetConfigCache();
  });

  it('loads development defaults without throwing', () => {
    const cfg = loadConfig({ NODE_ENV: 'development' });
    assert.equal(cfg.NODE_ENV, 'development');
    assert.equal(cfg.JWT_SECRET, INSECURE_SECRET_DEFAULTS.JWT_SECRET);
  });

  it('loads platform config with sections', () => {
    const platform = loadPlatformConfig({ NODE_ENV: 'development', APP_ENV: 'development' });
    assert.equal(platform.app.environment, 'development');
    assert.equal(platform.api.globalPrefix, 'api');
  });
});
