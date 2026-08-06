import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  CANCELLATION_MANAGER,
  CHECKPOINT_MANAGER,
  CIRCUIT_BREAKER,
  EXECUTION_RELIABILITY_SERVICE,
  FAILURE_CLASSIFIER,
  RECOVERY_COORDINATOR,
  RECOVERY_STATE_BUILDER,
  RELIABILITY_CONTROLLER,
  RETRY_COORDINATOR,
  TIMEOUT_MANAGER,
} from './contracts';
import { ExecutionReliabilityService } from './execution-reliability.service';
import { CancellationManager } from './processors/cancellation.manager';
import { CheckpointManager } from './processors/checkpoint.manager';
import { CircuitBreaker } from './processors/circuit.breaker';
import { FailureClassifier } from './processors/failure.classifier';
import { RecoveryCoordinator } from './processors/recovery.coordinator';
import { RecoveryStateBuilder } from './processors/recovery.state.builder';
import { ReliabilityController } from './processors/reliability.controller';
import { RetryCoordinator } from './processors/retry.coordinator';
import { TimeoutManager } from './processors/timeout.manager';

/**
 * Execution Reliability Engine (Layer 5.4).
 * Public API: EXECUTION_RELIABILITY_SERVICE → IExecutionReliabilityService.handle()
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
    FailureClassifier,
    RetryCoordinator,
    RecoveryCoordinator,
    CheckpointManager,
    TimeoutManager,
    CancellationManager,
    CircuitBreaker,
    RecoveryStateBuilder,
    ReliabilityController,
    ExecutionReliabilityService,
    { provide: FAILURE_CLASSIFIER, useExisting: FailureClassifier },
    { provide: RETRY_COORDINATOR, useExisting: RetryCoordinator },
    { provide: RECOVERY_COORDINATOR, useExisting: RecoveryCoordinator },
    { provide: CHECKPOINT_MANAGER, useExisting: CheckpointManager },
    { provide: TIMEOUT_MANAGER, useExisting: TimeoutManager },
    { provide: CANCELLATION_MANAGER, useExisting: CancellationManager },
    { provide: CIRCUIT_BREAKER, useExisting: CircuitBreaker },
    { provide: RECOVERY_STATE_BUILDER, useExisting: RecoveryStateBuilder },
    { provide: RELIABILITY_CONTROLLER, useExisting: ReliabilityController },
    {
      provide: EXECUTION_RELIABILITY_SERVICE,
      useExisting: ExecutionReliabilityService,
    },
  ],
  exports: [EXECUTION_RELIABILITY_SERVICE],
})
export class ReliabilityModule {}
