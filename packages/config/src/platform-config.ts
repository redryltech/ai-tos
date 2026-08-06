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
  EVENT_BUS_ENABLED: boolean;
  EVENT_BUS_DRIVER: string;
  EVENT_BUS_MAX_LISTENERS: number;
  EVENT_BUS_DISPATCH: string;
  KERNEL_SCHEDULER_ENABLED: boolean;
  KERNEL_SCHEDULER_TICK_MS: number;
  KERNEL_SCHEDULER_MAX_CONCURRENCY: number;
  KERNEL_SCHEDULER_DEFAULT_TIMEOUT_MS: number;
  KERNEL_SCHEDULER_DEFAULT_MAX_RETRIES: number;
  KERNEL_SCHEDULER_DEFAULT_PRIORITY: number;
  KERNEL_SCHEDULER_RETRY_BACKOFF_MS: number;
  KERNEL_CONTEXT_ENABLED: boolean;
  KERNEL_CONTEXT_EMIT_EVENTS: boolean;
  KERNEL_STATE_ENABLED: boolean;
  KERNEL_STATE_EMIT_EVENTS: boolean;
  KERNEL_STATE_MAX_ENTRIES: number;
  KERNEL_RESOURCE_ENABLED: boolean;
  KERNEL_RESOURCE_EMIT_EVENTS: boolean;
  KERNEL_RESOURCE_MAX_WORKERS: number;
  KERNEL_RESOURCE_MAX_MODEL_SLOTS: number;
  KERNEL_RESOURCE_MAX_MEMORY_MB: number;
  KERNEL_RESOURCE_MAX_CONCURRENCY: number;
  KERNEL_LIFECYCLE_ENABLED: boolean;
  KERNEL_LIFECYCLE_EMIT_EVENTS: boolean;
  KERNEL_LIFECYCLE_MAX_ENTRIES: number;
  KERNEL_COMM_ENABLED: boolean;
  KERNEL_COMM_EMIT_EVENTS: boolean;
  KERNEL_COMM_REQUEST_TIMEOUT_MS: number;
  KERNEL_COMM_MAX_PENDING_REQUESTS: number;
  PERCEPTION_ENABLED: boolean;
  PERCEPTION_EMIT_EVENTS: boolean;
  PERCEPTION_DEFAULT_LANGUAGE: string;
  THINKING_ENABLED: boolean;
  THINKING_EMIT_EVENTS: boolean;
  THINKING_MAX_CANDIDATES: number;
  DECISION_ENABLED: boolean;
  DECISION_EMIT_EVENTS: boolean;
  DECISION_MIN_CONFIDENCE: number;
  DECISION_APPROVAL_CONFIDENCE_THRESHOLD: number;
  PLANNING_ENABLED: boolean;
  PLANNING_EMIT_EVENTS: boolean;
  PLANNING_MAX_TASKS: number;
  OUTPUT_ENABLED: boolean;
  OUTPUT_EMIT_EVENTS: boolean;
  OUTPUT_DEFAULT_PRIORITY: 'low' | 'normal' | 'high' | 'critical';
  MEMORY_ENABLED: boolean;
  MEMORY_EMIT_EVENTS: boolean;
  MEMORY_PROVIDER: 'memory';
  MEMORY_MAX_ENTRIES: number;
  MEMORY_SESSION_TTL_SECONDS: number;
  MEMORY_LONG_TERM_TTL_SECONDS: number;
  MEMORY_EPISODIC_TTL_SECONDS: number;
  MEMORY_ARCHIVE_AFTER_DAYS: number;
  KNOWLEDGE_ENABLED: boolean;
  KNOWLEDGE_EMIT_EVENTS: boolean;
  KNOWLEDGE_PROVIDER: 'memory';
  KNOWLEDGE_MAX_DOCUMENTS: number;
  KNOWLEDGE_CHUNK_SIZE: number;
  KNOWLEDGE_CHUNK_OVERLAP: number;
  KNOWLEDGE_DEFAULT_TOP_K: number;
  KNOWLEDGE_SEARCH_MODE: 'keyword' | 'semantic' | 'hybrid' | 'metadata';
  CAPABILITY_ENABLED: boolean;
  CAPABILITY_EMIT_EVENTS: boolean;
  CAPABILITY_DEFAULT_TIMEOUT_MS: number;
  CAPABILITY_MAX_PARALLEL: number;
  CAPABILITY_FALLBACK_ENABLED: boolean;
  CAPABILITY_PREFERRED_TIER: 'local' | 'cloud' | 'enterprise';
  MODEL_ENABLED: boolean;
  MODEL_EMIT_EVENTS: boolean;
  MODEL_DEFAULT_TIMEOUT_MS: number;
  MODEL_STREAMING_ENABLED: boolean;
  MODEL_HEALTH_CHECK_INTERVAL_MS: number;
  MODEL_DEFAULT_PROVIDER: string;
  MODEL_AUTH_MODE: 'api_key' | 'oauth' | 'jwt' | 'managed_identity' | 'certificate';
  TOOL_ENABLED: boolean;
  TOOL_EMIT_EVENTS: boolean;
  TOOL_DEFAULT_TIMEOUT_MS: number;
  TOOL_MAX_CONCURRENT: number;
  TOOL_STREAMING_ENABLED: boolean;
  TOOL_REGISTRATION_ENABLED: boolean;
  TOOL_ALLOW_SHELL: boolean;
  INTEGRATION_ENABLED: boolean;
  INTEGRATION_EMIT_EVENTS: boolean;
  INTEGRATION_DEFAULT_TIMEOUT_MS: number;
  INTEGRATION_POOL_SIZE: number;
  INTEGRATION_HEALTH_CHECK_INTERVAL_MS: number;
  INTEGRATION_DEFAULT_AUTH_MODE:
    | 'api_key'
    | 'oauth'
    | 'oauth2'
    | 'jwt'
    | 'managed_identity'
    | 'certificate'
    | 'basic';
  INTEGRATION_REGISTRATION_ENABLED: boolean;
  POLICY_ENABLED: boolean;
  POLICY_EMIT_EVENTS: boolean;
  POLICY_PROVIDER: 'memory';
  POLICY_CONFLICT_STRATEGY: 'most_restrictive' | 'highest_authority';
  POLICY_VERSION_RETENTION: number;
  POLICY_REGISTRATION_ENABLED: boolean;
  WORKFLOW_ENABLED: boolean;
  WORKFLOW_EMIT_EVENTS: boolean;
  WORKFLOW_MAX_NODES: number;
  WORKFLOW_ALLOW_EMPTY: boolean;
  WORKFLOW_DEFAULT_STRATEGY:
    | 'sequential'
    | 'parallel'
    | 'hybrid'
    | 'conditional'
    | 'fan_out'
    | 'fan_in';
  TASK_ENABLED: boolean;
  TASK_EMIT_EVENTS: boolean;
  TASK_MAX_TASKS: number;
  TASK_ALLOW_EMPTY: boolean;
  EXECUTION_ENABLED: boolean;
  EXECUTION_EMIT_EVENTS: boolean;
  EXECUTION_MAX_CONCURRENCY: number;
  EXECUTION_TOKEN_BUDGET: number;
  EXECUTION_CPU_UNITS: number;
  EXECUTION_MEMORY_MB: number;
  EXECUTION_GPU_UNITS: number;
  EXECUTION_RATE_LIMIT_PER_SEC: number;
  EXECUTION_WORKER_PROVIDER: 'local' | 'stub';
  RELIABILITY_ENABLED: boolean;
  RELIABILITY_EMIT_EVENTS: boolean;
  RELIABILITY_MAX_RETRIES: number;
  RELIABILITY_RETRY_BACKOFF_MS: number;
  RELIABILITY_EXECUTION_TIMEOUT_MS: number;
  RELIABILITY_HEARTBEAT_TIMEOUT_MS: number;
  RELIABILITY_IDLE_TIMEOUT_MS: number;
  RELIABILITY_CIRCUIT_FAILURE_THRESHOLD: number;
  RELIABILITY_CIRCUIT_RESET_MS: number;
  RELIABILITY_CHECKPOINT_PROVIDER: 'memory';
  STREAMING_ENABLED: boolean;
  STREAMING_EMIT_EVENTS: boolean;
  STREAMING_MAX_BUFFER_SIZE: number;
  STREAMING_MAX_SUBSCRIBERS: number;
  STREAMING_BACKPRESSURE_HIGH_WATERMARK: number;
  STREAMING_BACKPRESSURE_LOW_WATERMARK: number;
  STREAMING_TRANSPORT_PROVIDER: 'memory' | 'event_bus';
  FINALIZATION_ENABLED: boolean;
  FINALIZATION_EMIT_EVENTS: boolean;
  FINALIZATION_ALLOW_PARTIAL: boolean;
  FINALIZATION_REQUIRE_OUTPUTS: boolean;
  FINALIZATION_SCHEMA_VERSION: string;
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

export type EventBusDriver = 'memory';
export type EventBusDispatch = 'parallel' | 'sequential';

export interface EventBusSectionConfig {
  enabled: boolean;
  driver: EventBusDriver;
  /** Optional external bus URL for future Kafka/Redis transports. */
  url?: string;
  maxListenersPerTopic: number;
  dispatch: EventBusDispatch;
}

export function parseEventBusDriver(raw: string): EventBusDriver {
  void raw;
  return 'memory';
}

export function parseEventBusDispatch(raw: string): EventBusDispatch {
  return raw.trim().toLowerCase() === 'sequential' ? 'sequential' : 'parallel';
}

export interface KernelSectionConfig {
  schedulerEnabled: boolean;
  tickMs: number;
  maxConcurrency: number;
  defaultTimeoutMs: number;
  defaultMaxRetries: number;
  defaultPriority: number;
  retryBackoffMs: number;
  contextEnabled: boolean;
  contextEmitEvents: boolean;
  stateEnabled: boolean;
  stateEmitEvents: boolean;
  stateMaxEntries: number;
  resourceEnabled: boolean;
  resourceEmitEvents: boolean;
  resourceMaxWorkers: number;
  resourceMaxModelSlots: number;
  resourceMaxMemoryMb: number;
  resourceMaxConcurrency: number;
  lifecycleEnabled: boolean;
  lifecycleEmitEvents: boolean;
  lifecycleMaxEntries: number;
  commEnabled: boolean;
  commEmitEvents: boolean;
  commRequestTimeoutMs: number;
  commMaxPendingRequests: number;
}

export interface PerceptionSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  defaultLanguage: string;
}

export interface ThinkingSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  maxCandidates: number;
}

export interface DecisionSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  minConfidence: number;
  approvalConfidenceThreshold: number;
}

export interface PlanningSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  maxTasks: number;
}

export interface OutputSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  defaultPriority: 'low' | 'normal' | 'high' | 'critical';
}

export interface MemorySectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  provider: 'memory';
  maxEntries: number;
  sessionTtlSeconds: number;
  /** 0 = no expiry */
  longTermTtlSeconds: number;
  /** 0 = no expiry */
  episodicTtlSeconds: number;
  archiveAfterDays: number;
}

export interface KnowledgeSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  provider: 'memory';
  maxDocuments: number;
  chunkSize: number;
  chunkOverlap: number;
  defaultTopK: number;
  searchMode: 'keyword' | 'semantic' | 'hybrid' | 'metadata';
}

export interface CapabilitySectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  defaultTimeoutMs: number;
  maxParallel: number;
  fallbackEnabled: boolean;
  preferredTier: 'local' | 'cloud' | 'enterprise';
}

export interface ModelSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  defaultTimeoutMs: number;
  streamingEnabled: boolean;
  healthCheckIntervalMs: number;
  defaultProvider: string;
  authMode: 'api_key' | 'oauth' | 'jwt' | 'managed_identity' | 'certificate';
}

export interface ToolSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  defaultTimeoutMs: number;
  maxConcurrent: number;
  streamingEnabled: boolean;
  registrationEnabled: boolean;
  allowShell: boolean;
}

export interface IntegrationSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  defaultTimeoutMs: number;
  poolSize: number;
  healthCheckIntervalMs: number;
  defaultAuthMode:
    | 'api_key'
    | 'oauth'
    | 'oauth2'
    | 'jwt'
    | 'managed_identity'
    | 'certificate'
    | 'basic';
  registrationEnabled: boolean;
}

export interface PolicySectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  provider: 'memory';
  conflictStrategy: 'most_restrictive' | 'highest_authority';
  versionRetention: number;
  registrationEnabled: boolean;
}

export interface WorkflowSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  maxNodes: number;
  allowEmpty: boolean;
  defaultStrategy:
    | 'sequential'
    | 'parallel'
    | 'hybrid'
    | 'conditional'
    | 'fan_out'
    | 'fan_in';
}

export interface TaskSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  maxTasks: number;
  allowEmpty: boolean;
}

export interface ExecutionSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  maxConcurrency: number;
  tokenBudget: number;
  cpuUnits: number;
  memoryMb: number;
  gpuUnits: number;
  rateLimitPerSec: number;
  workerProvider: 'local' | 'stub';
}

export interface ReliabilitySectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  maxRetries: number;
  retryBackoffMs: number;
  executionTimeoutMs: number;
  heartbeatTimeoutMs: number;
  idleTimeoutMs: number;
  circuitFailureThreshold: number;
  circuitResetMs: number;
  checkpointProvider: 'memory';
}

export interface StreamingSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  maxBufferSize: number;
  maxSubscribers: number;
  backpressureHighWatermark: number;
  backpressureLowWatermark: number;
  transportProvider: 'memory' | 'event_bus';
}

export interface FinalizationSectionConfig {
  enabled: boolean;
  emitEvents: boolean;
  allowPartial: boolean;
  requireOutputs: boolean;
  schemaVersion: string;
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
  eventBus: EventBusSectionConfig;
  kernel: KernelSectionConfig;
  perception: PerceptionSectionConfig;
  thinking: ThinkingSectionConfig;
  decision: DecisionSectionConfig;
  planning: PlanningSectionConfig;
  output: OutputSectionConfig;
  memory: MemorySectionConfig;
  knowledge: KnowledgeSectionConfig;
  capability: CapabilitySectionConfig;
  model: ModelSectionConfig;
  tool: ToolSectionConfig;
  integration: IntegrationSectionConfig;
  policy: PolicySectionConfig;
  workflow: WorkflowSectionConfig;
  task: TaskSectionConfig;
  execution: ExecutionSectionConfig;
  reliability: ReliabilitySectionConfig;
  streaming: StreamingSectionConfig;
  finalization: FinalizationSectionConfig;
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
    eventBus: {
      enabled: raw.EVENT_BUS_ENABLED,
      driver: parseEventBusDriver(raw.EVENT_BUS_DRIVER),
      url: raw.EVENT_BUS_URL,
      maxListenersPerTopic: raw.EVENT_BUS_MAX_LISTENERS,
      dispatch: parseEventBusDispatch(raw.EVENT_BUS_DISPATCH),
    },
    kernel: {
      schedulerEnabled: raw.KERNEL_SCHEDULER_ENABLED,
      tickMs: raw.KERNEL_SCHEDULER_TICK_MS,
      maxConcurrency: raw.KERNEL_SCHEDULER_MAX_CONCURRENCY,
      defaultTimeoutMs: raw.KERNEL_SCHEDULER_DEFAULT_TIMEOUT_MS,
      defaultMaxRetries: raw.KERNEL_SCHEDULER_DEFAULT_MAX_RETRIES,
      defaultPriority: raw.KERNEL_SCHEDULER_DEFAULT_PRIORITY,
      retryBackoffMs: raw.KERNEL_SCHEDULER_RETRY_BACKOFF_MS,
      contextEnabled: raw.KERNEL_CONTEXT_ENABLED,
      contextEmitEvents: raw.KERNEL_CONTEXT_EMIT_EVENTS,
      stateEnabled: raw.KERNEL_STATE_ENABLED,
      stateEmitEvents: raw.KERNEL_STATE_EMIT_EVENTS,
      stateMaxEntries: raw.KERNEL_STATE_MAX_ENTRIES,
      resourceEnabled: raw.KERNEL_RESOURCE_ENABLED,
      resourceEmitEvents: raw.KERNEL_RESOURCE_EMIT_EVENTS,
      resourceMaxWorkers: raw.KERNEL_RESOURCE_MAX_WORKERS,
      resourceMaxModelSlots: raw.KERNEL_RESOURCE_MAX_MODEL_SLOTS,
      resourceMaxMemoryMb: raw.KERNEL_RESOURCE_MAX_MEMORY_MB,
      resourceMaxConcurrency: raw.KERNEL_RESOURCE_MAX_CONCURRENCY,
      lifecycleEnabled: raw.KERNEL_LIFECYCLE_ENABLED,
      lifecycleEmitEvents: raw.KERNEL_LIFECYCLE_EMIT_EVENTS,
      lifecycleMaxEntries: raw.KERNEL_LIFECYCLE_MAX_ENTRIES,
      commEnabled: raw.KERNEL_COMM_ENABLED,
      commEmitEvents: raw.KERNEL_COMM_EMIT_EVENTS,
      commRequestTimeoutMs: raw.KERNEL_COMM_REQUEST_TIMEOUT_MS,
      commMaxPendingRequests: raw.KERNEL_COMM_MAX_PENDING_REQUESTS,
    },
    perception: {
      enabled: raw.PERCEPTION_ENABLED,
      emitEvents: raw.PERCEPTION_EMIT_EVENTS,
      defaultLanguage: raw.PERCEPTION_DEFAULT_LANGUAGE,
    },
    thinking: {
      enabled: raw.THINKING_ENABLED,
      emitEvents: raw.THINKING_EMIT_EVENTS,
      maxCandidates: raw.THINKING_MAX_CANDIDATES,
    },
    decision: {
      enabled: raw.DECISION_ENABLED,
      emitEvents: raw.DECISION_EMIT_EVENTS,
      minConfidence: raw.DECISION_MIN_CONFIDENCE,
      approvalConfidenceThreshold: raw.DECISION_APPROVAL_CONFIDENCE_THRESHOLD,
    },
    planning: {
      enabled: raw.PLANNING_ENABLED,
      emitEvents: raw.PLANNING_EMIT_EVENTS,
      maxTasks: raw.PLANNING_MAX_TASKS,
    },
    output: {
      enabled: raw.OUTPUT_ENABLED,
      emitEvents: raw.OUTPUT_EMIT_EVENTS,
      defaultPriority: raw.OUTPUT_DEFAULT_PRIORITY,
    },
    memory: {
      enabled: raw.MEMORY_ENABLED,
      emitEvents: raw.MEMORY_EMIT_EVENTS,
      provider: raw.MEMORY_PROVIDER,
      maxEntries: raw.MEMORY_MAX_ENTRIES,
      sessionTtlSeconds: raw.MEMORY_SESSION_TTL_SECONDS,
      longTermTtlSeconds: raw.MEMORY_LONG_TERM_TTL_SECONDS,
      episodicTtlSeconds: raw.MEMORY_EPISODIC_TTL_SECONDS,
      archiveAfterDays: raw.MEMORY_ARCHIVE_AFTER_DAYS,
    },
    knowledge: {
      enabled: raw.KNOWLEDGE_ENABLED,
      emitEvents: raw.KNOWLEDGE_EMIT_EVENTS,
      provider: raw.KNOWLEDGE_PROVIDER,
      maxDocuments: raw.KNOWLEDGE_MAX_DOCUMENTS,
      chunkSize: raw.KNOWLEDGE_CHUNK_SIZE,
      chunkOverlap: raw.KNOWLEDGE_CHUNK_OVERLAP,
      defaultTopK: raw.KNOWLEDGE_DEFAULT_TOP_K,
      searchMode: raw.KNOWLEDGE_SEARCH_MODE,
    },
    capability: {
      enabled: raw.CAPABILITY_ENABLED,
      emitEvents: raw.CAPABILITY_EMIT_EVENTS,
      defaultTimeoutMs: raw.CAPABILITY_DEFAULT_TIMEOUT_MS,
      maxParallel: raw.CAPABILITY_MAX_PARALLEL,
      fallbackEnabled: raw.CAPABILITY_FALLBACK_ENABLED,
      preferredTier: raw.CAPABILITY_PREFERRED_TIER,
    },
    model: {
      enabled: raw.MODEL_ENABLED,
      emitEvents: raw.MODEL_EMIT_EVENTS,
      defaultTimeoutMs: raw.MODEL_DEFAULT_TIMEOUT_MS,
      streamingEnabled: raw.MODEL_STREAMING_ENABLED,
      healthCheckIntervalMs: raw.MODEL_HEALTH_CHECK_INTERVAL_MS,
      defaultProvider: raw.MODEL_DEFAULT_PROVIDER,
      authMode: raw.MODEL_AUTH_MODE,
    },
    tool: {
      enabled: raw.TOOL_ENABLED,
      emitEvents: raw.TOOL_EMIT_EVENTS,
      defaultTimeoutMs: raw.TOOL_DEFAULT_TIMEOUT_MS,
      maxConcurrent: raw.TOOL_MAX_CONCURRENT,
      streamingEnabled: raw.TOOL_STREAMING_ENABLED,
      registrationEnabled: raw.TOOL_REGISTRATION_ENABLED,
      allowShell: raw.TOOL_ALLOW_SHELL,
    },
    integration: {
      enabled: raw.INTEGRATION_ENABLED,
      emitEvents: raw.INTEGRATION_EMIT_EVENTS,
      defaultTimeoutMs: raw.INTEGRATION_DEFAULT_TIMEOUT_MS,
      poolSize: raw.INTEGRATION_POOL_SIZE,
      healthCheckIntervalMs: raw.INTEGRATION_HEALTH_CHECK_INTERVAL_MS,
      defaultAuthMode: raw.INTEGRATION_DEFAULT_AUTH_MODE,
      registrationEnabled: raw.INTEGRATION_REGISTRATION_ENABLED,
    },
    policy: {
      enabled: raw.POLICY_ENABLED,
      emitEvents: raw.POLICY_EMIT_EVENTS,
      provider: raw.POLICY_PROVIDER,
      conflictStrategy: raw.POLICY_CONFLICT_STRATEGY,
      versionRetention: raw.POLICY_VERSION_RETENTION,
      registrationEnabled: raw.POLICY_REGISTRATION_ENABLED,
    },
    workflow: {
      enabled: raw.WORKFLOW_ENABLED,
      emitEvents: raw.WORKFLOW_EMIT_EVENTS,
      maxNodes: raw.WORKFLOW_MAX_NODES,
      allowEmpty: raw.WORKFLOW_ALLOW_EMPTY,
      defaultStrategy: raw.WORKFLOW_DEFAULT_STRATEGY,
    },
    task: {
      enabled: raw.TASK_ENABLED,
      emitEvents: raw.TASK_EMIT_EVENTS,
      maxTasks: raw.TASK_MAX_TASKS,
      allowEmpty: raw.TASK_ALLOW_EMPTY,
    },
    execution: {
      enabled: raw.EXECUTION_ENABLED,
      emitEvents: raw.EXECUTION_EMIT_EVENTS,
      maxConcurrency: raw.EXECUTION_MAX_CONCURRENCY,
      tokenBudget: raw.EXECUTION_TOKEN_BUDGET,
      cpuUnits: raw.EXECUTION_CPU_UNITS,
      memoryMb: raw.EXECUTION_MEMORY_MB,
      gpuUnits: raw.EXECUTION_GPU_UNITS,
      rateLimitPerSec: raw.EXECUTION_RATE_LIMIT_PER_SEC,
      workerProvider: raw.EXECUTION_WORKER_PROVIDER,
    },
    reliability: {
      enabled: raw.RELIABILITY_ENABLED,
      emitEvents: raw.RELIABILITY_EMIT_EVENTS,
      maxRetries: raw.RELIABILITY_MAX_RETRIES,
      retryBackoffMs: raw.RELIABILITY_RETRY_BACKOFF_MS,
      executionTimeoutMs: raw.RELIABILITY_EXECUTION_TIMEOUT_MS,
      heartbeatTimeoutMs: raw.RELIABILITY_HEARTBEAT_TIMEOUT_MS,
      idleTimeoutMs: raw.RELIABILITY_IDLE_TIMEOUT_MS,
      circuitFailureThreshold: raw.RELIABILITY_CIRCUIT_FAILURE_THRESHOLD,
      circuitResetMs: raw.RELIABILITY_CIRCUIT_RESET_MS,
      checkpointProvider: raw.RELIABILITY_CHECKPOINT_PROVIDER,
    },
    streaming: {
      enabled: raw.STREAMING_ENABLED,
      emitEvents: raw.STREAMING_EMIT_EVENTS,
      maxBufferSize: raw.STREAMING_MAX_BUFFER_SIZE,
      maxSubscribers: raw.STREAMING_MAX_SUBSCRIBERS,
      backpressureHighWatermark: raw.STREAMING_BACKPRESSURE_HIGH_WATERMARK,
      backpressureLowWatermark: raw.STREAMING_BACKPRESSURE_LOW_WATERMARK,
      transportProvider: raw.STREAMING_TRANSPORT_PROVIDER,
    },
    finalization: {
      enabled: raw.FINALIZATION_ENABLED,
      emitEvents: raw.FINALIZATION_EMIT_EVENTS,
      allowPartial: raw.FINALIZATION_ALLOW_PARTIAL,
      requireOutputs: raw.FINALIZATION_REQUIRE_OUTPUTS,
      schemaVersion: raw.FINALIZATION_SCHEMA_VERSION,
    },
  };
}
