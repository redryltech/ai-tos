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
