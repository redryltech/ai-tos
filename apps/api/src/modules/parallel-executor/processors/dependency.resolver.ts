import { Injectable } from '@nestjs/common';
import type { ExecutableTask } from '../../task-manager/models/task.models';
import type { ExecutableTaskCollection } from '../../task-manager/models/task.models';
import type { IDependencyResolver } from '../contracts';
import { ExecutionError } from '../models/execution.models';

/**
 * Dependency Resolver — select tasks eligible to run.
 * Respects dependency graph; never executes.
 */
@Injectable()
export class DependencyResolver implements IDependencyResolver {
  resolveReady(
    collection: ExecutableTaskCollection,
    completedIds: ReadonlySet<string>,
    failedIds: ReadonlySet<string>,
    runningIds: ReadonlySet<string>,
  ): readonly ExecutableTask[] {
    if (!collection?.tasks) {
      throw new ExecutionError('ExecutableTaskCollection.tasks is required');
    }

    const known = new Set(collection.tasks.map((t) => t.id));
    for (const task of collection.tasks) {
      for (const depId of task.dependencyIds) {
        if (!known.has(depId)) {
          throw new ExecutionError(
            `Invalid dependency reference "${depId}" on task ${task.id}`,
          );
        }
      }
    }

    const ready = collection.tasks.filter((task) => {
      if (completedIds.has(task.id) || failedIds.has(task.id)) return false;
      if (runningIds.has(task.id)) return false;
      if (task.state === 'CANCELLED' || task.state === 'FAILED') return false;
      if (task.state === 'COMPLETED') return false;

      const depsSatisfied = task.dependencyIds.every((depId) =>
        completedIds.has(depId),
      );
      if (!depsSatisfied) return false;

      const blockedByFailure = task.dependencyIds.some((depId) =>
        failedIds.has(depId),
      );
      if (blockedByFailure) return false;

      return (
        task.state === 'READY' ||
        task.state === 'WAITING' ||
        task.state === 'CREATED' ||
        task.state === 'RUNNING'
      );
    });

    return Object.freeze([...ready].sort((a, b) => {
      const ao = typeof a.metadata.order === 'number' ? a.metadata.order : 0;
      const bo = typeof b.metadata.order === 'number' ? b.metadata.order : 0;
      return ao - bo || a.id.localeCompare(b.id);
    }));
  }
}
