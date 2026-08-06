import { Injectable } from '@nestjs/common';
import type { ExecutableWorkflow } from '../../workflow/models/workflow.models';
import type { IExecutableTaskBuilder } from '../contracts';
import type {
  ExecutableTask,
  ExecutableTaskCollection,
  LifecycleTask,
} from '../models/task.models';

/**
 * Executable Task Builder — assemble immutable ExecutableTaskCollection.
 */
@Injectable()
export class ExecutableTaskBuilder implements IExecutableTaskBuilder {
  build(
    lifecycleTasks: readonly LifecycleTask[],
    workflow: ExecutableWorkflow,
  ): ExecutableTaskCollection {
    const tasks: ExecutableTask[] = lifecycleTasks.map((lt) =>
      Object.freeze({
        id: lt.draft.id,
        workflowId: lt.draft.workflowId,
        dependencyIds: lt.draft.dependencyIds,
        state: lt.state,
        metadata: Object.freeze({
          ...lt.draft.metadata,
          title: lt.draft.title,
          kind: lt.draft.kind,
          order: lt.draft.order,
          nodeId: lt.draft.nodeId,
        }),
        traceId: lt.draft.traceId,
        createdAt: lt.draft.createdAt,
      }),
    );

    const readyTaskIds = tasks
      .filter((t) => t.state === 'READY')
      .map((t) => t.id);
    const waitingCount = tasks.filter((t) => t.state === 'WAITING').length;

    return Object.freeze({
      workflowId: workflow.id,
      tasks: Object.freeze(tasks),
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        taskCount: tasks.length,
        readyCount: readyTaskIds.length,
        waitingCount,
        readyTaskIds: Object.freeze(readyTaskIds),
        dispatchPrepared: false,
        extras: Object.freeze({
          goal: workflow.metadata.goal,
          strategyKind: workflow.executionStrategy.kind,
          traceId: workflow.traceId,
          version: workflow.version,
        }),
      }),
      createdAt: new Date().toISOString(),
    });
  }
}
