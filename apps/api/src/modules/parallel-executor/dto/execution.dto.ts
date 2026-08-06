import type { ExecutableTaskCollection } from '../../task-manager/models/task.models';

/** Public execute() input DTO. */
export interface ExecuteTasksDto {
  readonly executableTaskCollection: ExecutableTaskCollection;
}
