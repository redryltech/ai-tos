import { Injectable } from '@nestjs/common';
import type { ITaskDispatcher } from '../contracts';
import type { ExecutableTaskCollection } from '../models/task.models';

/**
 * Task Dispatcher — prepare READY tasks for downstream execution.
 * Never executes tasks. Never transitions to RUNNING.
 */
@Injectable()
export class TaskDispatcher implements ITaskDispatcher {
  prepare(collection: ExecutableTaskCollection): ExecutableTaskCollection {
    const readyTaskIds = collection.tasks
      .filter((t) => t.state === 'READY')
      .map((t) => t.id);

    const tasks = collection.tasks.map((task) => {
      if (task.state !== 'READY') return task;
      return Object.freeze({
        ...task,
        metadata: Object.freeze({
          ...task.metadata,
          dispatchReady: true,
          dispatchPreparedAt: new Date().toISOString(),
        }),
      });
    });

    return Object.freeze({
      workflowId: collection.workflowId,
      tasks: Object.freeze(tasks),
      metadata: Object.freeze({
        ...collection.metadata,
        readyTaskIds: Object.freeze(readyTaskIds),
        readyCount: readyTaskIds.length,
        dispatchPrepared: true,
        extras: Object.freeze({
          ...collection.metadata.extras,
          dispatchQueueSize: readyTaskIds.length,
        }),
      }),
      createdAt: collection.createdAt,
    });
  }
}
