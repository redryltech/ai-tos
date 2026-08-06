import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  EXECUTION_FINALIZER_SERVICE,
  EXECUTION_RESULT_BUILDER,
  EXECUTION_STATUS_RESOLVER,
  EXECUTION_SUMMARY_BUILDER,
  FINALIZATION_CONTROLLER,
  METADATA_BUILDER,
  RESULT_COLLECTOR,
  RESULT_COMPOSER,
  RESULT_VALIDATOR,
} from './contracts';
import { ExecutionFinalizerService } from './execution-finalizer.service';
import { ExecutionResultBuilder } from './processors/execution.result.builder';
import { ExecutionStatusResolver } from './processors/execution.status.resolver';
import { ExecutionSummaryBuilder } from './processors/execution.summary.builder';
import { FinalizationController } from './processors/finalization.controller';
import { MetadataBuilder } from './processors/metadata.builder';
import { ResultCollector } from './processors/result.collector';
import { ResultComposer } from './processors/result.composer';
import { ResultValidator } from './processors/result.validator';

/**
 * Execution Finalizer (Layer 5.6).
 * Public API: EXECUTION_FINALIZER_SERVICE → IExecutionFinalizerService.finalize()
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
    ResultCollector,
    ResultValidator,
    ResultComposer,
    ExecutionSummaryBuilder,
    MetadataBuilder,
    ExecutionStatusResolver,
    ExecutionResultBuilder,
    FinalizationController,
    ExecutionFinalizerService,
    { provide: RESULT_COLLECTOR, useExisting: ResultCollector },
    { provide: RESULT_VALIDATOR, useExisting: ResultValidator },
    { provide: RESULT_COMPOSER, useExisting: ResultComposer },
    {
      provide: EXECUTION_SUMMARY_BUILDER,
      useExisting: ExecutionSummaryBuilder,
    },
    { provide: METADATA_BUILDER, useExisting: MetadataBuilder },
    {
      provide: EXECUTION_STATUS_RESOLVER,
      useExisting: ExecutionStatusResolver,
    },
    {
      provide: EXECUTION_RESULT_BUILDER,
      useExisting: ExecutionResultBuilder,
    },
    { provide: FINALIZATION_CONTROLLER, useExisting: FinalizationController },
    {
      provide: EXECUTION_FINALIZER_SERVICE,
      useExisting: ExecutionFinalizerService,
    },
  ],
  exports: [EXECUTION_FINALIZER_SERVICE],
})
export class FinalizerModule {}
