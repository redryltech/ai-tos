import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  CAPABILITY_CONTROLLER,
  CAPABILITY_ORCHESTRATOR,
  CAPABILITY_PROVIDER,
  CAPABILITY_REGISTRY,
  CAPABILITY_RESOLVER,
  CAPABILITY_ROUTER,
  CAPABILITY_SERVICE,
  INTEGRATION_PORT,
  KNOWLEDGE_PORT,
  MEMORY_PORT,
  MODEL_PORT,
  POLICY_PORT,
  TOOL_PORT,
} from './contracts';
import { CapabilityService } from './capability.service';
import {
  NoopIntegrationPort,
  NoopKnowledgePort,
  NoopMemoryPort,
  NoopModelPort,
  NoopPolicyPort,
  NoopToolPort,
} from './ports/capability.ports';
import { CapabilityController } from './processors/capability.controller';
import { CapabilityOrchestrator } from './processors/capability.orchestrator';
import { CapabilityRegistry } from './processors/capability.registry';
import { CapabilityResolver } from './processors/capability.resolver';
import { CapabilityRouter } from './processors/capability.router';
import { LocalCapabilityProvider } from './providers/local.capability.provider';

/**
 * Capability Service (Layer 4.3).
 * Public API: CAPABILITY_SERVICE → ICapabilityService.execute()
 */
@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    MetricsModule,
    EventBusModule,
    HealthModule,
  ],
  providers: [
    { provide: CAPABILITY_PROVIDER, useClass: LocalCapabilityProvider },
    { provide: MEMORY_PORT, useClass: NoopMemoryPort },
    { provide: KNOWLEDGE_PORT, useClass: NoopKnowledgePort },
    { provide: MODEL_PORT, useClass: NoopModelPort },
    { provide: TOOL_PORT, useClass: NoopToolPort },
    { provide: INTEGRATION_PORT, useClass: NoopIntegrationPort },
    { provide: POLICY_PORT, useClass: NoopPolicyPort },
    CapabilityRegistry,
    CapabilityResolver,
    CapabilityRouter,
    CapabilityOrchestrator,
    CapabilityController,
    CapabilityService,
    { provide: CAPABILITY_REGISTRY, useExisting: CapabilityRegistry },
    { provide: CAPABILITY_RESOLVER, useExisting: CapabilityResolver },
    { provide: CAPABILITY_ROUTER, useExisting: CapabilityRouter },
    { provide: CAPABILITY_ORCHESTRATOR, useExisting: CapabilityOrchestrator },
    { provide: CAPABILITY_CONTROLLER, useExisting: CapabilityController },
    { provide: CAPABILITY_SERVICE, useExisting: CapabilityService },
  ],
  exports: [CAPABILITY_SERVICE],
})
export class CapabilityModule {}
