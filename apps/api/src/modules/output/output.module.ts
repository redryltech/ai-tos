import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  CAPABILITY_RESOLVER,
  EXECUTION_CONTRACT_BUILDER,
  INTENT_CONSOLIDATOR,
  OUTPUT_SERVICE,
  TRANSITION_VALIDATOR,
} from './contracts';
import { OutputService } from './output.service';
import { CapabilityResolver } from './processors/capability.resolver';
import { ExecutionContractBuilder } from './processors/execution-contract.builder';
import { IntentConsolidator } from './processors/intent.consolidator';
import { TransitionValidator } from './processors/transition.validator';

/**
 * Output Engine (Layer 3.5).
 * Public API: OUTPUT_SERVICE → IOutputService.buildOutput()
 * Completes AI Brain Cognitive Layer (Layer 3).
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
    IntentConsolidator,
    CapabilityResolver,
    ExecutionContractBuilder,
    TransitionValidator,
    OutputService,
    { provide: INTENT_CONSOLIDATOR, useExisting: IntentConsolidator },
    { provide: CAPABILITY_RESOLVER, useExisting: CapabilityResolver },
    { provide: EXECUTION_CONTRACT_BUILDER, useExisting: ExecutionContractBuilder },
    { provide: TRANSITION_VALIDATOR, useExisting: TransitionValidator },
    { provide: OUTPUT_SERVICE, useExisting: OutputService },
  ],
  exports: [OUTPUT_SERVICE],
})
export class OutputModule {}
