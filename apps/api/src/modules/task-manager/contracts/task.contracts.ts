import type { ExecutableWorkflow } from '../../workflow/models/workflow.models';
import type {
  ExecutableTask,
  ExecutableTaskCollection,
  LifecycleTask,
  TaskDependencyGraph,
  TaskDraft,
} from '../models/task.models';

export const TASK_MANAGER_SERVICE = Symbol('TASK_MANAGER_SERVICE');
export const TASK_CONTROLLER = Symbol('TASK_CONTROLLER');
export const TASK_BUILDER = Symbol('TASK_BUILDER');
export const TASK_DEPENDENCY_MANAGER = Symbol('TASK_DEPENDENCY_MANAGER');
export const TASK_LIFECYCLE_MANAGER = Symbol('TASK_LIFECYCLE_MANAGER');
export const EXECUTABLE_TASK_BUILDER = Symbol('EXECUTABLE_TASK_BUILDER');
export const TASK_DISPATCHER = Symbol('TASK_DISPATCHER');

export interface ITaskBuilder {
  build(workflow: ExecutableWorkflow): readonly TaskDraft[];
}

export interface ITaskDependencyManager {
  build(drafts: readonly TaskDraft[]): TaskDependencyGraph;
}

export interface ITaskLifecycleManager {
  initialize(
    drafts: readonly TaskDraft[],
    graph: TaskDependencyGraph,
  ): readonly LifecycleTask[];
}

export interface IExecutableTaskBuilder {
  build(
    lifecycleTasks: readonly LifecycleTask[],
    workflow: ExecutableWorkflow,
  ): ExecutableTaskCollection;
}

export interface ITaskDispatcher {
  prepare(collection: ExecutableTaskCollection): ExecutableTaskCollection;
}

export interface ITaskController {
  createTasks(workflow: ExecutableWorkflow): Promise<ExecutableTaskCollection>;
}

/** Sole public Task Manager contract. */
export interface ITaskManagerService {
  createTasks(
    executableWorkflow: ExecutableWorkflow,
  ): Promise<ExecutableTaskCollection>;
}

export type { ExecutableTask, ExecutableTaskCollection };
