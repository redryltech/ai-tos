import { Inject, Injectable } from '@nestjs/common';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import {
  CANCELLATION_MANAGER,
  CHECKPOINT_MANAGER,
  CIRCUIT_BREAKER,
  FAILURE_CLASSIFIER,
  RECOVERY_COORDINATOR,
  RECOVERY_STATE_BUILDER,
  RETRY_COORDINATOR,
  TIMEOUT_MANAGER,
  type ICancellationManager,
  type ICheckpointManager,
  type ICircuitBreaker,
  type IFailureClassifier,
  type IRecoveryCoordinator,
  type IRecoveryStateBuilder,
  type IReliabilityController,
  type IRetryCoordinator,
  type ITimeoutManager,
} from '../contracts';
import type { HandleReliabilityDto } from '../dto/reliability.dto';
import type { ExecutionRecoveryState } from '../models/reliability.models';
import { ReliabilityError } from '../models/reliability.models';

/**
 * Reliability Controller — orchestrate reliability pipeline only.
 * Never executes tasks, streams, or finalizes.
 */
@Injectable()
export class ReliabilityController implements IReliabilityController {
  constructor(
    @Inject(FAILURE_CLASSIFIER)
    private readonly classifier: IFailureClassifier,
    @Inject(RETRY_COORDINATOR)
    private readonly retryCoordinator: IRetryCoordinator,
    @Inject(RECOVERY_COORDINATOR)
    private readonly recoveryCoordinator: IRecoveryCoordinator,
    @Inject(CHECKPOINT_MANAGER)
    private readonly checkpointManager: ICheckpointManager,
    @Inject(TIMEOUT_MANAGER)
    private readonly timeoutManager: ITimeoutManager,
    @Inject(CANCELLATION_MANAGER)
    private readonly cancellationManager: ICancellationManager,
    @Inject(CIRCUIT_BREAKER)
    private readonly circuitBreaker: ICircuitBreaker,
    @Inject(RECOVERY_STATE_BUILDER)
    private readonly stateBuilder: IRecoveryStateBuilder,
  ) {}

  async handle(
    dto: HandleReliabilityDto | ExecutionProgress,
  ): Promise<ExecutionRecoveryState> {
    const progress = this.unwrap(dto);
    const classification = this.classifier.classify(progress);
    const retry = this.retryCoordinator.decide(progress, classification);
    const recovery = this.recoveryCoordinator.plan(
      progress,
      classification,
      retry,
    );
    const timeout = this.timeoutManager.assess(progress);
    const cancellation = this.cancellationManager.decide(progress);
    const circuit = this.circuitBreaker.assess(progress, classification);

    const checkpoint =
      progress.failedTasks > 0 ||
      recovery.resumeFromCheckpoint ||
      progress.completedTasks > 0
        ? this.checkpointManager.create(progress)
        : null;

    if (progress.failedTasks === 0 && progress.pendingTasks === 0) {
      this.circuitBreaker.recordSuccess(progress.workflowId);
    }

    return this.stateBuilder.build({
      progress,
      classification,
      retry,
      recovery,
      checkpoint,
      timeout,
      cancellation,
      circuit,
    });
  }

  private unwrap(
    dto: HandleReliabilityDto | ExecutionProgress,
  ): ExecutionProgress {
    if (!dto || typeof dto !== 'object') {
      throw new ReliabilityError('ExecutionProgress is required');
    }
    if ('executionProgress' in dto) {
      if (!dto.executionProgress) {
        throw new ReliabilityError('ExecutionProgress is required');
      }
      return dto.executionProgress;
    }
    return dto;
  }
}
