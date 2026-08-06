import type { ExecutableWorkflow } from '../../workflow/models/workflow.models';

/** Public createTasks() input DTO. */
export interface CreateTasksDto {
  readonly executableWorkflow: ExecutableWorkflow;
}
