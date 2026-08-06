import { Inject, Injectable } from '@nestjs/common';
import type { ExecutableWorkflow } from '../../workflow/models/workflow.models';
import {
  EXECUTABLE_TASK_BUILDER,
  TASK_BUILDER,
  TASK_DEPENDENCY_MANAGER,
  TASK_DISPATCHER,
  TASK_LIFECYCLE_MANAGER,
  type IExecutableTaskBuilder,
  type ITaskBuilder,
  type ITaskController,
  type ITaskDependencyManager,
  type ITaskDispatcher,
  type ITaskLifecycleManager,
} from '../contracts';
import type { CreateTasksDto } from '../dto/task.dto';
import type { ExecutableTaskCollection } from '../models/task.models';
import { TaskValidationError } from '../models/task.models';

/**
 * Task Controller — orchestrate Task Manager pipeline only.
 * Never executes, retries, recovers, streams, or finalizes.
 */
@Injectable()
export class TaskController implements ITaskController {
  constructor(
    @Inject(TASK_BUILDER) private readonly builder: ITaskBuilder,
    @Inject(TASK_DEPENDENCY_MANAGER)
    private readonly dependencyManager: ITaskDependencyManager,
    @Inject(TASK_LIFECYCLE_MANAGER)
    private readonly lifecycleManager: ITaskLifecycleManager,
    @Inject(EXECUTABLE_TASK_BUILDER)
    private readonly executableBuilder: IExecutableTaskBuilder,
    @Inject(TASK_DISPATCHER) private readonly dispatcher: ITaskDispatcher,
  ) {}

  async createTasks(
    dto: CreateTasksDto | ExecutableWorkflow,
  ): Promise<ExecutableTaskCollection> {
    const workflow = this.unwrap(dto);
    const drafts = this.builder.build(workflow);
    const graph = this.dependencyManager.build(drafts);
    const lifecycle = this.lifecycleManager.initialize(graph.drafts, graph);
    const collection = this.executableBuilder.build(lifecycle, workflow);
    return this.dispatcher.prepare(collection);
  }

  private unwrap(dto: CreateTasksDto | ExecutableWorkflow): ExecutableWorkflow {
    if (!dto || typeof dto !== 'object') {
      throw new TaskValidationError('ExecutableWorkflow is required');
    }
    if ('executableWorkflow' in dto) {
      if (!dto.executableWorkflow) {
        throw new TaskValidationError('ExecutableWorkflow is required');
      }
      return dto.executableWorkflow;
    }
    return dto;
  }
}
