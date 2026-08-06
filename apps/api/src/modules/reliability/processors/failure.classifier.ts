import { Injectable } from '@nestjs/common';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { IFailureClassifier } from '../contracts';
import type { FailureClassification } from '../models/reliability.models';
import { ReliabilityError } from '../models/reliability.models';

/**
 * Failure Classifier — classify execution failures.
 * Never executes, retries, or recovers.
 */
@Injectable()
export class FailureClassifier implements IFailureClassifier {
  classify(progress: ExecutionProgress): FailureClassification {
    if (!progress || typeof progress !== 'object') {
      throw new ReliabilityError('ExecutionProgress is required');
    }

    const failedTaskIds = Object.freeze([
      ...(progress.metadata?.failedTaskIds ?? []),
    ]);
    const extras = progress.metadata?.extras ?? {};
    const explicit =
      typeof extras.failureClass === 'string'
        ? extras.failureClass.toUpperCase()
        : null;
    const reasonHint =
      typeof extras.failureReason === 'string'
        ? extras.failureReason.toLowerCase()
        : '';

    if (progress.failedTasks === 0 && (progress.metadata.cancelledTasks ?? 0) === 0) {
      return Object.freeze({
        failureClass: 'UNKNOWN' as const,
        reason: 'No failures detected',
        failedTaskIds,
        retryable: false,
      });
    }

    const mapped = this.mapExplicit(explicit) ?? this.mapHint(reasonHint, extras);

    return Object.freeze({
      failureClass: mapped.failureClass,
      reason: mapped.reason,
      failedTaskIds,
      retryable: mapped.retryable,
    });
  }

  private mapExplicit(
    value: string | null,
  ): { failureClass: FailureClassification['failureClass']; reason: string; retryable: boolean } | null {
    switch (value) {
      case 'TRANSIENT':
        return { failureClass: 'TRANSIENT', reason: 'Explicit transient failure', retryable: true };
      case 'PERMANENT':
        return { failureClass: 'PERMANENT', reason: 'Explicit permanent failure', retryable: false };
      case 'TIMEOUT':
        return { failureClass: 'TIMEOUT', reason: 'Explicit timeout failure', retryable: true };
      case 'DEPENDENCY':
        return { failureClass: 'DEPENDENCY', reason: 'Explicit dependency failure', retryable: false };
      case 'RESOURCE':
        return { failureClass: 'RESOURCE', reason: 'Explicit resource failure', retryable: true };
      case 'USER':
        return { failureClass: 'USER', reason: 'Explicit user failure', retryable: false };
      case 'UNKNOWN':
        return { failureClass: 'UNKNOWN', reason: 'Explicit unknown failure', retryable: false };
      default:
        return null;
    }
  }

  private mapHint(
    hint: string,
    extras: Readonly<Record<string, string | number | boolean | null>>,
  ): { failureClass: FailureClassification['failureClass']; reason: string; retryable: boolean } {
    if (hint.includes('timeout') || extras.timedOut === true) {
      return { failureClass: 'TIMEOUT', reason: 'Timeout indicated in progress', retryable: true };
    }
    if (hint.includes('resource') || extras.resourceExhausted === true) {
      return { failureClass: 'RESOURCE', reason: 'Resource exhaustion indicated', retryable: true };
    }
    if (hint.includes('depend')) {
      return { failureClass: 'DEPENDENCY', reason: 'Dependency failure indicated', retryable: false };
    }
    if (hint.includes('cancel') || hint.includes('user') || extras.userCancelled === true) {
      return { failureClass: 'USER', reason: 'User/system cancellation indicated', retryable: false };
    }
    if (hint.includes('transient') || hint.includes('unavailable') || hint.includes('network')) {
      return { failureClass: 'TRANSIENT', reason: 'Transient failure indicated', retryable: true };
    }
    if (hint.includes('permanent') || hint.includes('invalid') || hint.includes('forbidden')) {
      return { failureClass: 'PERMANENT', reason: 'Permanent failure indicated', retryable: false };
    }
    if (extras.forceFail === true) {
      return { failureClass: 'TRANSIENT', reason: 'Forced failure treated as transient', retryable: true };
    }
    return {
      failureClass: 'UNKNOWN',
      reason: 'Unclassified execution failure',
      retryable: false,
    };
  }
}
