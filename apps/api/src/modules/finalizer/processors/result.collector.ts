import { Injectable } from '@nestjs/common';
import type { IResultCollector } from '../contracts';
import type {
  CollectedResult,
  CompletedExecution,
} from '../models/finalizer.models';
import { FinalizationError } from '../models/finalizer.models';

/**
 * Result Collector — collect completed execution outputs.
 * Never executes or streams.
 */
@Injectable()
export class ResultCollector implements IResultCollector {
  collect(completed: CompletedExecution): CollectedResult {
    if (!completed || typeof completed !== 'object') {
      throw new FinalizationError('CompletedExecution is required');
    }
    if (!completed.workflowId) {
      throw new FinalizationError('CompletedExecution.workflowId is required');
    }

    const startedAt = Date.parse(completed.startedAt);
    const endedAt = Date.parse(completed.endedAt);
    if (Number.isNaN(startedAt) || Number.isNaN(endedAt)) {
      throw new FinalizationError('Invalid startedAt/endedAt timestamps');
    }
    if (endedAt < startedAt) {
      throw new FinalizationError('endedAt must be >= startedAt');
    }

    return Object.freeze({
      outputs: Object.freeze([...(completed.outputs ?? [])]),
      completedTaskIds: Object.freeze([...(completed.completedTaskIds ?? [])]),
      failedTaskIds: Object.freeze([...(completed.failedTaskIds ?? [])]),
      cancelledTaskIds: Object.freeze([...(completed.cancelledTaskIds ?? [])]),
      retryCount: Math.max(0, completed.retryCount ?? 0),
      durationMs: endedAt - startedAt,
    });
  }
}
