import type {
  CollectedResult,
  CompletedExecution,
  ComposedResult,
  ExecutionFinalStatus,
  ExecutionResult,
  ExecutionResultMetadata,
  ExecutionSummary,
  ValidatedResult,
} from '../models/finalizer.models';

export const EXECUTION_FINALIZER_SERVICE = Symbol('EXECUTION_FINALIZER_SERVICE');
export const FINALIZATION_CONTROLLER = Symbol('FINALIZATION_CONTROLLER');
export const RESULT_COLLECTOR = Symbol('RESULT_COLLECTOR');
export const RESULT_VALIDATOR = Symbol('RESULT_VALIDATOR');
export const RESULT_COMPOSER = Symbol('RESULT_COMPOSER');
export const EXECUTION_SUMMARY_BUILDER = Symbol('EXECUTION_SUMMARY_BUILDER');
export const METADATA_BUILDER = Symbol('METADATA_BUILDER');
export const EXECUTION_STATUS_RESOLVER = Symbol('EXECUTION_STATUS_RESOLVER');
export const EXECUTION_RESULT_BUILDER = Symbol('EXECUTION_RESULT_BUILDER');

export interface IResultCollector {
  collect(completed: CompletedExecution): CollectedResult;
}

export interface IResultValidator {
  validate(
    completed: CompletedExecution,
    collected: CollectedResult,
  ): ValidatedResult;
}

export interface IResultComposer {
  compose(validated: ValidatedResult): ComposedResult;
}

export interface IExecutionSummaryBuilder {
  build(
    collected: CollectedResult,
    validated: ValidatedResult,
    composed: ComposedResult,
  ): ExecutionSummary;
}

export interface IMetadataBuilder {
  build(completed: CompletedExecution): ExecutionResultMetadata;
}

export interface IExecutionStatusResolver {
  resolve(
    completed: CompletedExecution,
    collected: CollectedResult,
    validated: ValidatedResult,
  ): ExecutionFinalStatus;
}

export interface IExecutionResultBuilder {
  build(input: {
    completed: CompletedExecution;
    status: ExecutionFinalStatus;
    composed: ComposedResult;
    summary: ExecutionSummary;
    metadata: ExecutionResultMetadata;
  }): ExecutionResult;
}

export interface IFinalizationController {
  finalize(completed: CompletedExecution): Promise<ExecutionResult>;
}

/** Sole public Execution Finalizer contract. */
export interface IExecutionFinalizerService {
  finalize(completedExecution: CompletedExecution): Promise<ExecutionResult>;
}
