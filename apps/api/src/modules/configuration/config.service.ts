import { Injectable } from '@nestjs/common';
import {
  loadPlatformConfig,
  type AiSectionConfig,
  type ApiSectionConfig,
  type AppSectionConfig,
  type DatabaseSectionConfig,
  type MonitoringSectionConfig,
  type PlatformConfig,
  type RedisSectionConfig,
  type SecuritySectionConfig,
} from '@ai-tos/config';

/**
 * Nest DI facade over the centralized platform configuration.
 * No business or AI logic — typed accessors only.
 */
@Injectable()
export class ConfigService {
  private readonly platform: PlatformConfig;

  constructor() {
    this.platform = loadPlatformConfig();
  }

  /** Full organized configuration snapshot. */
  get all(): PlatformConfig {
    return this.platform;
  }

  get app(): AppSectionConfig {
    return this.platform.app;
  }

  get api(): ApiSectionConfig {
    return this.platform.api;
  }

  get database(): DatabaseSectionConfig {
    return this.platform.database;
  }

  get redis(): RedisSectionConfig {
    return this.platform.redis;
  }

  get ai(): AiSectionConfig {
    return this.platform.ai;
  }

  get security(): SecuritySectionConfig {
    return this.platform.security;
  }

  get monitoring(): MonitoringSectionConfig {
    return this.platform.monitoring;
  }
}
