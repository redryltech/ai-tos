import { Injectable } from '@nestjs/common';
import {
  loadPlatformConfig,
  type AiSectionConfig,
  type ApiSectionConfig,
  type AppSectionConfig,
  type DatabaseSectionConfig,
  type HealthSectionConfig,
  type MonitoringSectionConfig,
  type CacheSectionConfig,
  type EventBusSectionConfig,
  type KernelSectionConfig,
  type PerceptionSectionConfig,
  type ThinkingSectionConfig,
  type DecisionSectionConfig,
  type PlanningSectionConfig,
  type OutputSectionConfig,
  type MemorySectionConfig,
  type KnowledgeSectionConfig,
  type CapabilitySectionConfig,
  type ModelSectionConfig,
  type ToolSectionConfig,
  type IntegrationSectionConfig,
  type PolicySectionConfig,
  type WorkflowSectionConfig,
  type TaskSectionConfig,
  type ExecutionSectionConfig,
  type ReliabilitySectionConfig,
  type StreamingSectionConfig,
  type FinalizationSectionConfig,
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

  get health(): HealthSectionConfig {
    return this.platform.health;
  }

  get cache(): CacheSectionConfig {
    return this.platform.cache;
  }

  get eventBus(): EventBusSectionConfig {
    return this.platform.eventBus;
  }

  get kernel(): KernelSectionConfig {
    return this.platform.kernel;
  }

  get perception(): PerceptionSectionConfig {
    return this.platform.perception;
  }

  get thinking(): ThinkingSectionConfig {
    return this.platform.thinking;
  }

  get decision(): DecisionSectionConfig {
    return this.platform.decision;
  }

  get planning(): PlanningSectionConfig {
    return this.platform.planning;
  }

  get output(): OutputSectionConfig {
    return this.platform.output;
  }

  get memory(): MemorySectionConfig {
    return this.platform.memory;
  }

  get knowledge(): KnowledgeSectionConfig {
    return this.platform.knowledge;
  }

  get capability(): CapabilitySectionConfig {
    return this.platform.capability;
  }

  get model(): ModelSectionConfig {
    return this.platform.model;
  }

  get tool(): ToolSectionConfig {
    return this.platform.tool;
  }

  get integration(): IntegrationSectionConfig {
    return this.platform.integration;
  }

  get policy(): PolicySectionConfig {
    return this.platform.policy;
  }

  get workflow(): WorkflowSectionConfig {
    return this.platform.workflow;
  }

  get task(): TaskSectionConfig {
    return this.platform.task;
  }

  get execution(): ExecutionSectionConfig {
    return this.platform.execution;
  }

  get reliability(): ReliabilitySectionConfig {
    return this.platform.reliability;
  }

  get streaming(): StreamingSectionConfig {
    return this.platform.streaming;
  }

  get finalization(): FinalizationSectionConfig {
    return this.platform.finalization;
  }
}
