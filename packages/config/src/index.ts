/**
 * @ai-tos/config — centralized, typed configuration for the AI Operating System.
 * Phase 2.1.1 Configuration Service foundation.
 */

export {
  INSECURE_SECRET_DEFAULTS,
  assertProductionSecrets,
  assertSecureSecrets,
  loadConfig,
  loadPlatformConfig,
  resetConfigCache,
  config,
  type AppConfig,
} from './env';

export {
  DeployEnvironmentSchema,
  resolveDeployEnvironment,
  requiresSecureSecrets,
  toPlatformConfig,
  parseLogTransports,
  parseHealthReadinessRequired,
  type DeployEnvironment,
  type PlatformConfig,
  type AppSectionConfig,
  type ApiSectionConfig,
  type DatabaseSectionConfig,
  type RedisSectionConfig,
  type AiSectionConfig,
  type SecuritySectionConfig,
  type MonitoringSectionConfig,
  type HealthSectionConfig,
  type HealthComponentName,
  type LogLevel,
  type LogTransportName,
} from './platform-config';
