import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { ICircuitBreaker } from '../contracts';
import type {
  CircuitAssessment,
  FailureClassification,
} from '../models/reliability.models';

/**
 * Circuit Breaker — prevent cascading failures (closed/open/half-open).
 * Never executes tasks.
 */
@Injectable()
export class CircuitBreaker implements ICircuitBreaker {
  private readonly failures = new Map<
    string,
    { count: number; openedAt?: number }
  >();

  constructor(private readonly config: ConfigService) {}

  assess(
    progress: ExecutionProgress,
    classification: FailureClassification,
  ): CircuitAssessment {
    const key = progress.workflowId || 'global';
    const entry = this.failures.get(key) ?? { count: 0 };
    const now = Date.now();
    const threshold = this.config.reliability.circuitFailureThreshold;
    const resetMs = this.config.reliability.circuitResetMs;

    if (entry.openedAt !== undefined) {
      if (now - entry.openedAt >= resetMs) {
        this.failures.set(key, { count: entry.count });
        return Object.freeze({
          state: 'half_open' as const,
          failureCount: entry.count,
          opened: false,
        });
      }
      return Object.freeze({
        state: 'open' as const,
        failureCount: entry.count,
        opened: true,
      });
    }

    if (progress.failedTasks > 0 && classification.failureClass !== 'USER') {
      const nextCount = entry.count + Math.max(1, progress.failedTasks);
      if (nextCount >= threshold) {
        this.failures.set(key, { count: nextCount, openedAt: now });
        return Object.freeze({
          state: 'open' as const,
          failureCount: nextCount,
          opened: true,
        });
      }
      this.failures.set(key, { count: nextCount });
      return Object.freeze({
        state: 'closed' as const,
        failureCount: nextCount,
        opened: false,
      });
    }

    return Object.freeze({
      state: 'closed' as const,
      failureCount: entry.count,
      opened: false,
    });
  }

  recordSuccess(workflowId: string): void {
    this.failures.delete(workflowId || 'global');
  }
}
