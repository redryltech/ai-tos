import { Injectable } from '@nestjs/common';
import type { IRecoveryStateBuilder } from '../contracts';
import type {
  CancellationDecision,
  CheckpointRecord,
  CircuitAssessment,
  ExecutionRecoveryState,
  FailureClassification,
  RecoveryPlan,
  RecoveryStatus,
  RetryDecision,
  TimeoutAssessment,
} from '../models/reliability.models';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';

/**
 * Recovery State Builder — assemble immutable ExecutionRecoveryState.
 */
@Injectable()
export class RecoveryStateBuilder implements IRecoveryStateBuilder {
  build(input: {
    progress: ExecutionProgress;
    classification: FailureClassification;
    retry: RetryDecision;
    recovery: RecoveryPlan;
    checkpoint: CheckpointRecord | null;
    timeout: TimeoutAssessment;
    cancellation: CancellationDecision;
    circuit: CircuitAssessment;
  }): ExecutionRecoveryState {
    const {
      progress,
      classification,
      retry,
      recovery,
      checkpoint,
      timeout,
      cancellation,
      circuit,
    } = input;

    const recoveryStatus = this.resolveStatus({
      progress,
      classification,
      retry,
      recovery,
      timeout,
      cancellation,
      circuit,
    });

    return Object.freeze({
      workflowId: progress.workflowId,
      recoveryStatus,
      retryCount: retry.retryCount,
      checkpointId: checkpoint?.id ?? null,
      circuitState: circuit.state,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        failureClass: classification.failureClass,
        recoveryAction: recovery.action,
        retryEligible: retry.eligible,
        maxRetries: retry.maxRetries,
        backoffMs: retry.backoffMs,
        cancelled: cancellation.cancelled,
        cancellationMode: cancellation.mode,
        executionTimedOut: timeout.executionTimedOut,
        heartbeatTimedOut: timeout.heartbeatTimedOut,
        idleTimedOut: timeout.idleTimedOut,
        extras: Object.freeze({
          reason: classification.reason,
          recoveryReason: recovery.reason,
          retryReason: retry.reason,
          timeoutReason: timeout.reason ?? null,
          cancellationReason: cancellation.reason ?? null,
          circuitFailureCount: circuit.failureCount,
          progressPercentage: progress.progressPercentage,
          failedTasks: progress.failedTasks,
          completedTasks: progress.completedTasks,
        }),
      }),
      traceId: progress.traceId,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveStatus(input: {
    progress: ExecutionProgress;
    classification: FailureClassification;
    retry: RetryDecision;
    recovery: RecoveryPlan;
    timeout: TimeoutAssessment;
    cancellation: CancellationDecision;
    circuit: CircuitAssessment;
  }): RecoveryStatus {
    if (input.cancellation.cancelled) return 'cancelled';
    if (input.circuit.opened) return 'circuit_open';
    if (
      input.timeout.executionTimedOut ||
      input.timeout.heartbeatTimedOut ||
      input.timeout.idleTimedOut
    ) {
      return 'timed_out';
    }
    if (input.progress.failedTasks === 0 && input.progress.pendingTasks === 0) {
      return 'healthy';
    }
    if (input.retry.eligible) return 'retry_scheduled';
    if (
      input.recovery.action === 'resume' ||
      input.recovery.action === 'restart' ||
      input.recovery.action === 'rollback'
    ) {
      return input.recovery.resumeFromCheckpoint ? 'checkpointed' : 'recovering';
    }
    if (
      input.classification.retryable &&
      input.retry.retryCount >= input.retry.maxRetries
    ) {
      return 'exhausted';
    }
    return 'failed';
  }
}
