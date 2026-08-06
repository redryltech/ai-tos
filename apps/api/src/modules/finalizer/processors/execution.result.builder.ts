import { Injectable } from '@nestjs/common';
import type { IExecutionResultBuilder } from '../contracts';
import type {
  CompletedExecution,
  ComposedResult,
  ExecutionFinalStatus,
  ExecutionResult,
  ExecutionResultMetadata,
  ExecutionSummary,
} from '../models/finalizer.models';

/**
 * Execution Result Builder — assemble immutable ExecutionResult.
 */
@Injectable()
export class ExecutionResultBuilder implements IExecutionResultBuilder {
  build(input: {
    completed: CompletedExecution;
    status: ExecutionFinalStatus;
    composed: ComposedResult;
    summary: ExecutionSummary;
    metadata: ExecutionResultMetadata;
  }): ExecutionResult {
    return Object.freeze({
      workflowId: input.completed.workflowId,
      status: input.status,
      outputs: input.composed.outputs,
      summary: input.summary,
      metadata: input.metadata,
      traceId: input.completed.traceId,
      completedAt: input.completed.endedAt,
    });
  }
}
