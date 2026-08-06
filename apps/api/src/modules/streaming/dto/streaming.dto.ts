import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';

/** Public stream() input DTO. */
export interface StreamExecutionDto {
  readonly executionProgress: ExecutionProgress;
}
