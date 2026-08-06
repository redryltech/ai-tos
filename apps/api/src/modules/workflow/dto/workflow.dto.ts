import type { ExecutionIntent } from '../../output/models/execution-intent.models';

/** Public createWorkflow() input DTO. */
export interface CreateWorkflowDto {
  readonly executionIntent: ExecutionIntent;
}
