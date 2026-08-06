import { Inject, Injectable } from '@nestjs/common';
import {
  EXECUTION_RESULT_BUILDER,
  EXECUTION_STATUS_RESOLVER,
  EXECUTION_SUMMARY_BUILDER,
  METADATA_BUILDER,
  RESULT_COLLECTOR,
  RESULT_COMPOSER,
  RESULT_VALIDATOR,
  type IExecutionResultBuilder,
  type IExecutionStatusResolver,
  type IExecutionSummaryBuilder,
  type IFinalizationController,
  type IMetadataBuilder,
  type IResultCollector,
  type IResultComposer,
  type IResultValidator,
} from '../contracts';
import type { FinalizeExecutionDto } from '../dto/finalizer.dto';
import type {
  CompletedExecution,
  ExecutionResult,
} from '../models/finalizer.models';
import { FinalizationError } from '../models/finalizer.models';

/**
 * Finalization Controller — orchestrate finalization pipeline only.
 * Never executes, retries, streams, or manages workflows/tasks.
 */
@Injectable()
export class FinalizationController implements IFinalizationController {
  constructor(
    @Inject(RESULT_COLLECTOR) private readonly collector: IResultCollector,
    @Inject(RESULT_VALIDATOR) private readonly validator: IResultValidator,
    @Inject(RESULT_COMPOSER) private readonly composer: IResultComposer,
    @Inject(EXECUTION_SUMMARY_BUILDER)
    private readonly summaryBuilder: IExecutionSummaryBuilder,
    @Inject(METADATA_BUILDER) private readonly metadataBuilder: IMetadataBuilder,
    @Inject(EXECUTION_STATUS_RESOLVER)
    private readonly statusResolver: IExecutionStatusResolver,
    @Inject(EXECUTION_RESULT_BUILDER)
    private readonly resultBuilder: IExecutionResultBuilder,
  ) {}

  async finalize(
    dto: FinalizeExecutionDto | CompletedExecution,
  ): Promise<ExecutionResult> {
    const completed = this.unwrap(dto);
    const collected = this.collector.collect(completed);
    const validated = this.validator.validate(completed, collected);
    const composed = this.composer.compose(validated);
    const summary = this.summaryBuilder.build(collected, validated, composed);
    const metadata = this.metadataBuilder.build(completed);
    const status = this.statusResolver.resolve(
      completed,
      collected,
      validated,
    );
    return this.resultBuilder.build({
      completed,
      status,
      composed,
      summary,
      metadata,
    });
  }

  private unwrap(
    dto: FinalizeExecutionDto | CompletedExecution,
  ): CompletedExecution {
    if (!dto || typeof dto !== 'object') {
      throw new FinalizationError('CompletedExecution is required');
    }
    if ('completedExecution' in dto) {
      if (!dto.completedExecution) {
        throw new FinalizationError('CompletedExecution is required');
      }
      return dto.completedExecution;
    }
    return dto;
  }
}
