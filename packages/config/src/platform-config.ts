/**
 * Strongly typed platform configuration sections (Phase 2.1.1).
 * No business or AI logic — structure and accessors only.
 */

/** Deployed runtime environments for the AI Operating System. */
export const DeployEnvironmentSchema = [
  'development',
  'testing',
  'staging',
  'production',
] as const;
export type DeployEnvironment = (typeof DeployEnvironmentSchema)[number];

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogTransportName = 'console' | 'file';
export type NodeEnv = 'development' | 'test' | 'production';
export type CookieSameSite = 'strict' | 'lax' | 'none';
export type OtelProtocol = 'grpc' | 'http/protobuf' | 'http/json';

/** Flat env shape required to build PlatformConfig (avoids circular imports). */
export interface FlatEnvConfig {
  NODE_ENV: NodeEnv;
  APP_ENV?: DeployEnvironment;
  APP_NAME: string;
  APP_VERSION: string;
  API_GLOBAL_PREFIX: string;
  LOG_LEVEL: LogLevel;
  LOG_TRANSPORTS: string;
  LOG_FILE_PATH?: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  API_KEY_ENCRYPTION_SECRET: string;
  AUTH_COOKIE_ACCESS_NAME: string;
  AUTH_COOKIE_REFRESH_NAME: string;
  AUTH_COOKIE_SECURE: boolean;
  AUTH_COOKIE_SAME_SITE: CookieSameSite;
  AUTH_COOKIE_DOMAIN?: string;
  CORS_ORIGIN: string;
  AI_SERVICE_URL: string;
  OTEL_EXPORTER_OTLP_ENDPOINT: string;
  OTEL_EXPORTER_OTLP_PROTOCOL: OtelProtocol;
  OTEL_SERVICE_NAME: string;
  OTEL_RESOURCE_ATTRIBUTES: string;
  OTEL_TRACES_EXPORTER: string;
  OTEL_METRICS_EXPORTER: string;
  OTEL_LOGS_EXPORTER: string;
  METRICS_ENABLED: boolean;
  METRICS_PREFIX: string;
  HEALTH_TIMEOUT_MS: number;
  HEALTH_CHECK_DATABASE: boolean;
  HEALTH_CHECK_REDIS: boolean;
  HEALTH_CHECK_CACHE: boolean;
  HEALTH_CHECK_AI_GATEWAY: boolean;
  HEALTH_CHECK_EVENT_BUS: boolean;
  REDIS_CACHE_URL: string;
  EVENT_BUS_URL?: string;
  HEALTH_READINESS_REQUIRED: string;
  CACHE_DRIVER: string;
  CACHE_TTL_SECONDS: number;
  CACHE_NAMESPACE: string;
  CACHE_MAX_MEMORY_ENTRIES: number;
}

export interface AppSectionConfig {
  name: string;
  version: string;
  environment: DeployEnvironment;
  logLevel: LogLevel;
  logTransports: LogTransportName[];
  logFilePath?: string;
  nodeEnv: NodeEnv;
}

/** Parse comma-separated LOG_TRANSPORTS into known transport names. */
export function parseLogTransports(raw: string): LogTransportName[] {
  const allowed = new Set<LogTransportName>(['console', 'file']);
  const parsed = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is LogTransportName => allowed.has(s as LogTransportName));
  return parsed.length > 0 ? [...new Set(parsed)] : ['console'];
}

export interface ApiSectionConfig {
  port: number;
  corsOrigin: string;
  globalPrefix: string;
}

export interface DatabaseSectionConfig {
  url: string;
}

export interface RedisSectionConfig {
  url: string;
}

/** Connection endpoints for AI services — not model/provider business logic. */
export interface AiSectionConfig {
  serviceUrl: string;
}

export interface SecuritySectionConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  apiKeyEncryptionSecret: string;
  authCookieAccessName: string;
  authCookieRefreshName: string;
  authCookieSecure: boolean;
  authCookieSameSite: CookieSameSite;
  authCookieDomain?: string;
}

export interface MonitoringSectionConfig {
  otelExporterOtlpEndpoint: string;
  otelExporterOtlpProtocol: OtelProtocol;
  otelServiceName: string;
  otelResourceAttributes: string;
  otelTracesExporter: string;
  otelMetricsExporter: string;
  otelLogsExporter: string;
  metricsEnabled: boolean;
  metricsPrefix: string;
}

export type HealthComponentName =
  | 'api'
  | 'database'
  | 'redis'
  | 'cache'
  | 'ai_gateway'
  | 'event_bus';

export interface HealthSectionConfig {
  timeoutMs: number;
  checkDatabase: boolean;
  checkRedis: boolean;
  checkCache: boolean;
  checkAiGateway: boolean;
  checkEventBus: boolean;
  redisCacheUrl: string;
  eventBusUrl?: string;
  /** Components that must be up for /ready (Kubernetes readiness). */
  readinessRequired: HealthComponentName[];
}

export type CacheDriver = 'memory' | 'redis';

export interface CacheSectionConfig {
  driver: CacheDriver;
  defaultTtlSeconds: number;
  namespace: string;
  redisUrl: string;
  maxMemoryEntries: number;
}

export function parseCacheDriver(raw: string): CacheDriver {
  const v = raw.trim().toLowerCase();
  return v === 'redis' ? 'redis' : 'memory';
}

/** Parse comma-separated readiness component list. */
export function parseHealthReadinessRequired(raw: string): HealthComponentName[] {
  const allowed = new Set<HealthComponentName>([
    'api',
    'database',
    'redis',
    'cache',
    'ai_gateway',
    'event_bus',
  ]);
  const parsed = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is HealthComponentName => allowed.has(s as HealthComponentName));
  return parsed.length > 0 ? [...new Set(parsed)] : ['api', 'database', 'redis'];
}

/** Centralized configuration every future AI OS module consumes. */
export interface PlatformConfig {
  app: AppSectionConfig;
  api: ApiSectionConfig;
  database: DatabaseSectionConfig;
  redis: RedisSectionConfig;
  ai: AiSectionConfig;
  security: SecuritySectionConfig;
  monitoring: MonitoringSectionConfig;
  health: HealthSectionConfig;
  cache: CacheSectionConfig;
}

/**
 * Resolve deploy environment from APP_ENV (preferred) or NODE_ENV.
 * `testing` maps from NODE_ENV=test when APP_ENV is unset.
 */
export function resolveDeployEnvironment(env: {
  APP_ENV?: string;
  NODE_ENV?: string;
}): DeployEnvironment {
  const appEnv = env.APP_ENV?.toLowerCase();
  if (
    appEnv === 'development' ||
    appEnv === 'testing' ||
    appEnv === 'staging' ||
    appEnv === 'production'
  ) {
    return appEnv;
  }

  if (env.NODE_ENV === 'test') return 'testing';
  if (env.NODE_ENV === 'production') return 'production';
  return 'development';
}

export function requiresSecureSecrets(environment: DeployEnvironment): boolean {
  return environment === 'staging' || environment === 'production';
}

/** Map validated flat env config → organized platform sections. */
export function toPlatformConfig(raw: FlatEnvConfig): PlatformConfig {
  const environment = resolveDeployEnvironment({
    APP_ENV: raw.APP_ENV,
    NODE_ENV: raw.NODE_ENV,
  });

  return {
    app: {
      name: raw.APP_NAME,
      version: raw.APP_VERSION,
      environment,
      logLevel: raw.LOG_LEVEL,
      logTransports: parseLogTransports(raw.LOG_TRANSPORTS),
      logFilePath: raw.LOG_FILE_PATH,
      nodeEnv: raw.NODE_ENV,
    },
    api: {
      port: raw.PORT,
      corsOrigin: raw.CORS_ORIGIN,
      globalPrefix: raw.API_GLOBAL_PREFIX,
    },
    database: {
      url: raw.DATABASE_URL,
    },
    redis: {
      url: raw.REDIS_URL,
    },
    ai: {
      serviceUrl: raw.AI_SERVICE_URL,
    },
    security: {
      jwtSecret: raw.JWT_SECRET,
      jwtExpiresIn: raw.JWT_EXPIRES_IN,
      jwtRefreshSecret: raw.JWT_REFRESH_SECRET,
      jwtRefreshExpiresIn: raw.JWT_REFRESH_EXPIRES_IN,
      apiKeyEncryptionSecret: raw.API_KEY_ENCRYPTION_SECRET,
      authCookieAccessName: raw.AUTH_COOKIE_ACCESS_NAME,
      authCookieRefreshName: raw.AUTH_COOKIE_REFRESH_NAME,
      authCookieSecure: raw.AUTH_COOKIE_SECURE,
      authCookieSameSite: raw.AUTH_COOKIE_SAME_SITE,
      authCookieDomain: raw.AUTH_COOKIE_DOMAIN,
    },
    monitoring: {
      otelExporterOtlpEndpoint: raw.OTEL_EXPORTER_OTLP_ENDPOINT,
      otelExporterOtlpProtocol: raw.OTEL_EXPORTER_OTLP_PROTOCOL,
      otelServiceName: raw.OTEL_SERVICE_NAME,
      otelResourceAttributes: raw.OTEL_RESOURCE_ATTRIBUTES,
      otelTracesExporter: raw.OTEL_TRACES_EXPORTER,
      otelMetricsExporter: raw.OTEL_METRICS_EXPORTER,
      otelLogsExporter: raw.OTEL_LOGS_EXPORTER,
      metricsEnabled: raw.METRICS_ENABLED,
      metricsPrefix: raw.METRICS_PREFIX,
    },
    health: {
      timeoutMs: raw.HEALTH_TIMEOUT_MS,
      checkDatabase: raw.HEALTH_CHECK_DATABASE,
      checkRedis: raw.HEALTH_CHECK_REDIS,
      checkCache: raw.HEALTH_CHECK_CACHE,
      checkAiGateway: raw.HEALTH_CHECK_AI_GATEWAY,
      checkEventBus: raw.HEALTH_CHECK_EVENT_BUS,
      redisCacheUrl: raw.REDIS_CACHE_URL,
      eventBusUrl: raw.EVENT_BUS_URL,
      readinessRequired: parseHealthReadinessRequired(raw.HEALTH_READINESS_REQUIRED),
    },
    cache: {
      driver: parseCacheDriver(raw.CACHE_DRIVER),
      defaultTtlSeconds: raw.CACHE_TTL_SECONDS,
      namespace: raw.CACHE_NAMESPACE,
      redisUrl: raw.REDIS_CACHE_URL,
      maxMemoryEntries: raw.CACHE_MAX_MEMORY_ENTRIES,
    },
  };
}
