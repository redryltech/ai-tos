import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  EFFECTIVE_POLICY_BUILDER,
  POLICY_COMPOSER,
  POLICY_CONFLICT_RESOLVER,
  POLICY_CONTROLLER,
  POLICY_PROVIDER,
  POLICY_REGISTRY,
  POLICY_RESOLVER,
  POLICY_SERVICE,
} from './contracts';
import { PolicyService } from './policy.service';
import { EffectivePolicyBuilder } from './processors/effective.policy.builder';
import { PolicyComposer } from './processors/policy.composer';
import { PolicyConflictResolver } from './processors/policy.conflict.resolver';
import { PolicyController } from './processors/policy.controller';
import { PolicyRegistry } from './processors/policy.registry';
import { PolicyResolver } from './processors/policy.resolver';
import { MemoryPolicyProvider } from './providers/memory.policy.provider';

/**
 * Policy Service (Layer 4.7).
 * Public API: POLICY_SERVICE → IPolicyService.resolve()
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
    { provide: POLICY_PROVIDER, useClass: MemoryPolicyProvider },
    PolicyRegistry,
    PolicyComposer,
    PolicyResolver,
    PolicyConflictResolver,
    EffectivePolicyBuilder,
    PolicyController,
    PolicyService,
    { provide: POLICY_REGISTRY, useExisting: PolicyRegistry },
    { provide: POLICY_COMPOSER, useExisting: PolicyComposer },
    { provide: POLICY_RESOLVER, useExisting: PolicyResolver },
    { provide: POLICY_CONFLICT_RESOLVER, useExisting: PolicyConflictResolver },
    { provide: EFFECTIVE_POLICY_BUILDER, useExisting: EffectivePolicyBuilder },
    { provide: POLICY_CONTROLLER, useExisting: PolicyController },
    { provide: POLICY_SERVICE, useExisting: PolicyService },
  ],
  exports: [POLICY_SERVICE],
})
export class PolicyModule {}
