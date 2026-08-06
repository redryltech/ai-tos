import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ExecutableWorkflow } from '../../workflow/models/workflow.models';
import type { ITaskBuilder } from '../contracts';
import type { TaskDraft } from '../models/task.models';
import { TaskValidationError } from '../models/task.models';
import { ConfigService } from '../../configuration/config.service';

/**
 * Task Builder — convert workflow nodes/tasks into TaskDrafts.
 * Does not build dependency graph or manage lifecycle.
 */
@Injectable()
export class TaskBuilder implements ITaskBuilder {
  constructor(private readonly config: ConfigService) {}

  build(workflow: ExecutableWorkflow): readonly TaskDraft[] {
    if (!workflow || typeof workflow !== 'object') {
      throw new TaskValidationError('ExecutableWorkflow is required');
    }
    if (!workflow.id) {
      throw new TaskValidationError('ExecutableWorkflow.id is required');
    }

    const sourceTasks = workflow.tasks ?? [];
    if (sourceTasks.length === 0 && !this.config.task.allowEmpty) {
      throw new TaskValidationError('ExecutableWorkflow contains no tasks');
    }
    if (sourceTasks.length > this.config.task.maxTasks) {
      throw new TaskValidationError(
        `Task count ${sourceTasks.length} exceeds TASK_MAX_TASKS (${this.config.task.maxTasks})`,
      );
    }

    const createdAt = new Date().toISOString();
    const drafts = sourceTasks.map((spec) =>
      Object.freeze({
        id: randomUUID(),
        workflowId: workflow.id,
        nodeId: spec.nodeId,
        title: spec.title,
        kind: spec.kind,
        order: spec.order,
        dependencyIds: Object.freeze([...spec.dependsOn]),
        metadata: Object.freeze({
          sourceTaskId: spec.id,
          nodeId: spec.nodeId,
          title: spec.title,
          kind: spec.kind,
          order: spec.order,
          strategyKind: workflow.executionStrategy.kind,
          goal: workflow.metadata.goal,
        }),
        traceId: workflow.traceId,
        createdAt,
      } satisfies TaskDraft),
    );

    return Object.freeze(drafts);
  }
}
