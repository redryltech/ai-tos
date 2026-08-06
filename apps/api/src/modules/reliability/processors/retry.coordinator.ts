import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { IRetryCoordinator } from '../contracts';
import type {
  FailureClassification,
  RetryDecision,
} from '../models/reliability.models';

/**
 * Retry Coordinator — determine retry eligibility and backoff.
 * Never executes tasks.
 */
@Injectable()
export class RetryCoordinator implements IRetryCoordinator {
  constructor(private readonly config: ConfigService) {}

  decide(
    progress: ExecutionProgress,
    classification: FailureClassification,
  ): RetryDecision {
    const maxRetries = this.config.reliability.maxRetries;
    const current =
      typeof progress.metadata.extras.retryCount === 'number'
        ? Math.max(0, progress.metadata.extras.retryCount)
        : 0;
    const backoffMs =
      this.config.reliability.retryBackoffMs * Math.max(1, current + 1);

    if (progress.failedTasks === 0) {
      return Object.freeze({
        eligible: false,
        retryCount: current,
        maxRetries,
        backoffMs: 0,
        reason: 'No failed tasks',
      });
    }

    if (!classification.retryable) {
      return Object.freeze({
        eligible: false,
        retryCount: current,
        maxRetries,
        backoffMs: 0,
        reason: `Failure class ${classification.failureClass} is not retryable`,
      });
    }

    if (current >= maxRetries) {
      return Object.freeze({
        eligible: false,
        retryCount: current,
        maxRetries,
        backoffMs: 0,
        reason: 'Max retries exhausted',
      });
    }

    return Object.freeze({
      eligible: true,
      retryCount: current + 1,
      maxRetries,
      backoffMs,
      reason: 'Retry scheduled under policy',
    });
  }
}
