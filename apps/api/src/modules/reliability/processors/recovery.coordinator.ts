import { Injectable } from '@nestjs/common';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { IRecoveryCoordinator } from '../contracts';
import type {
  FailureClassification,
  RecoveryPlan,
  RetryDecision,
} from '../models/reliability.models';

/**
 * Recovery Coordinator — choose resume/restart/rollback/cancel.
 * Never executes tasks.
 */
@Injectable()
export class RecoveryCoordinator implements IRecoveryCoordinator {
  plan(
    progress: ExecutionProgress,
    classification: FailureClassification,
    retry: RetryDecision,
  ): RecoveryPlan {
    if ((progress.metadata.cancelledTasks ?? 0) > 0 || classification.failureClass === 'USER') {
      return Object.freeze({
        action: 'cancel' as const,
        reason: 'User or cancelled progress requires cancellation',
        resumeFromCheckpoint: false,
      });
    }

    if (progress.failedTasks === 0 && progress.pendingTasks === 0) {
      return Object.freeze({
        action: 'none' as const,
        reason: 'Execution completed without recovery need',
        resumeFromCheckpoint: false,
      });
    }

    if (classification.failureClass === 'PERMANENT') {
      return Object.freeze({
        action: 'rollback' as const,
        reason: 'Permanent failure requires rollback',
        resumeFromCheckpoint: false,
      });
    }

    if (classification.failureClass === 'DEPENDENCY') {
      return Object.freeze({
        action: 'restart' as const,
        reason: 'Dependency failure requires restart from root',
        resumeFromCheckpoint: false,
      });
    }

    if (retry.eligible) {
      const resume =
        progress.completedTasks > 0 &&
        classification.failureClass !== 'RESOURCE';
      return Object.freeze({
        action: resume ? ('resume' as const) : ('restart' as const),
        reason: resume
          ? 'Retry eligible — resume from checkpoint'
          : 'Retry eligible — restart execution',
        resumeFromCheckpoint: resume,
      });
    }

    if (classification.failureClass === 'TIMEOUT') {
      return Object.freeze({
        action: 'restart' as const,
        reason: 'Timeout with retries exhausted — restart',
        resumeFromCheckpoint: false,
      });
    }

    return Object.freeze({
      action: 'rollback' as const,
      reason: 'No eligible retry — rollback',
      resumeFromCheckpoint: false,
    });
  }
}
