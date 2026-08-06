import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';

/** Public handle() input DTO. */
export interface HandleReliabilityDto {
  readonly executionProgress: ExecutionProgress;
}
