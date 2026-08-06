import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutableTaskCollection } from '../../task-manager/models/task.models';
import type { IProgressPublisher } from '../contracts';
import type {
  ExecutionProgress,
  ExecutionSnapshot,
} from '../models/execution.models';

/**
 * Progress Publisher — emit immutable ExecutionProgress snapshots.
 */
@Injectable()
export class ProgressPublisher implements IProgressPublisher {
  constructor(private readonly config: ConfigService) {}

  publish(
    snapshot: ExecutionSnapshot,
    collection: ExecutableTaskCollection,
    extras: Readonly<Record<string, string | number | boolean | null>> = {},
  ): ExecutionProgress {
    const total = collection.tasks.length;
    const completed = snapshot.completedTaskIds.length;
    const failed = snapshot.failedTaskIds.length;
    const cancelled = snapshot.cancelledTaskIds.length;
    const terminal = completed + failed + cancelled;
    const progressPercentage =
      total === 0 ? 100 : Math.min(100, Math.round((terminal / total) * 100));

    const traceId =
      collection.tasks[0]?.traceId ??
      (typeof collection.metadata.extras.traceId === 'string'
        ? collection.metadata.extras.traceId
        : collection.workflowId);

    return Object.freeze({
      workflowId: snapshot.workflowId,
      completedTasks: completed,
      runningTasks: snapshot.runningTaskIds.length,
      pendingTasks: snapshot.pendingTaskIds.length,
      failedTasks: failed,
      progressPercentage,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        totalTasks: total,
        cancelledTasks: cancelled,
        dispatchWaves:
          typeof extras.dispatchWaves === 'number' ? extras.dispatchWaves : 0,
        concurrencyLimit: this.config.execution.maxConcurrency,
        workerProvider: this.config.execution.workerProvider,
        completedTaskIds: Object.freeze([...snapshot.completedTaskIds]),
        failedTaskIds: Object.freeze([...snapshot.failedTaskIds]),
        extras: Object.freeze({ ...extras }),
      }),
      traceId,
      timestamp: new Date().toISOString(),
    });
  }
}
