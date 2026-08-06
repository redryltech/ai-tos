import { Injectable } from '@nestjs/common';
import type { IExecutionStatusResolver } from '../contracts';
import type {
  CollectedResult,
  CompletedExecution,
  ExecutionFinalStatus,
  ValidatedResult,
} from '../models/finalizer.models';

/**
 * Execution Status Resolver — resolve terminal status only.
 */
@Injectable()
export class ExecutionStatusResolver implements IExecutionStatusResolver {
  resolve(
    completed: CompletedExecution,
    collected: CollectedResult,
    validated: ValidatedResult,
  ): ExecutionFinalStatus {
    if (completed.rolledBack === true) return 'ROLLED_BACK';
    if (completed.timedOut === true) return 'TIMED_OUT';
    if (
      completed.cancelled === true ||
      collected.cancelledTaskIds.length > 0
    ) {
      return 'CANCELLED';
    }

    const completedCount = collected.completedTaskIds.length;
    const failedCount = collected.failedTaskIds.length;

    if (failedCount > 0 && completedCount > 0) return 'PARTIAL_SUCCESS';
    if (failedCount > 0 && completedCount === 0) return 'FAILED';
    if (!validated.valid && completedCount === 0) return 'FAILED';
    return 'SUCCESS';
  }
}
