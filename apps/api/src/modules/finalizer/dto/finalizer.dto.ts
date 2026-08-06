import type { CompletedExecution } from '../models/finalizer.models';

/** Public finalize() input DTO. */
export interface FinalizeExecutionDto {
  readonly completedExecution: CompletedExecution;
}
