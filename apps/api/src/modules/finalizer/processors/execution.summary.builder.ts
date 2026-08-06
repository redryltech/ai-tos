import { Injectable } from '@nestjs/common';
import type { IExecutionSummaryBuilder } from '../contracts';
import type {
  CollectedResult,
  ComposedResult,
  ExecutionSummary,
  ValidatedResult,
} from '../models/finalizer.models';

/**
 * Execution Summary Builder — duration, counts, retry, statistics.
 */
@Injectable()
export class ExecutionSummaryBuilder implements IExecutionSummaryBuilder {
  build(
    collected: CollectedResult,
    validated: ValidatedResult,
    composed: ComposedResult,
  ): ExecutionSummary {
    const completedTasks = collected.completedTaskIds.length;
    const failedTasks = collected.failedTaskIds.length;
    const cancelledTasks = collected.cancelledTaskIds.length;
    const totalTasks = completedTasks + failedTasks + cancelledTasks;
    const successRate =
      totalTasks === 0
        ? 100
        : Math.round((completedTasks / totalTasks) * 1000) / 10;

    return Object.freeze({
      durationMs: collected.durationMs,
      completedTasks,
      failedTasks,
      cancelledTasks,
      retryCount: collected.retryCount,
      totalTasks,
      successRate,
      statistics: Object.freeze({
        outputCount: composed.outputCount,
        issueCount: validated.issues.length,
        hasPartialFailures: validated.hasPartialFailures,
      }),
    });
  }
}
