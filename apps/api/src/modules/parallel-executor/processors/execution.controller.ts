import { Inject, Injectable } from '@nestjs/common';
import type { ExecutableTaskCollection } from '../../task-manager/models/task.models';
import {
  CONCURRENCY_COORDINATOR,
  DEPENDENCY_RESOLVER,
  EXECUTION_MONITOR,
  PROGRESS_PUBLISHER,
  RESOURCE_COORDINATOR,
  WORKER_DISPATCHER,
  type IConcurrencyCoordinator,
  type IDependencyResolver,
  type IExecutionController,
  type IExecutionMonitor,
  type IProgressPublisher,
  type IResourceCoordinator,
  type IWorkerDispatcher,
} from '../contracts';
import type { ExecuteTasksDto } from '../dto/execution.dto';
import type { ExecutionProgress } from '../models/execution.models';
import { ExecutionError } from '../models/execution.models';

/**
 * Execution Controller — orchestrate Parallel Executor pipeline.
 * Never retries, recovers, streams, or finalizes.
 */
@Injectable()
export class ExecutionController implements IExecutionController {
  constructor(
    @Inject(DEPENDENCY_RESOLVER)
    private readonly dependencyResolver: IDependencyResolver,
    @Inject(CONCURRENCY_COORDINATOR)
    private readonly concurrency: IConcurrencyCoordinator,
    @Inject(WORKER_DISPATCHER)
    private readonly dispatcher: IWorkerDispatcher,
    @Inject(RESOURCE_COORDINATOR)
    private readonly resources: IResourceCoordinator,
    @Inject(EXECUTION_MONITOR)
    private readonly monitor: IExecutionMonitor,
    @Inject(PROGRESS_PUBLISHER)
    private readonly publisher: IProgressPublisher,
  ) {}

  async execute(
    dto: ExecuteTasksDto | ExecutableTaskCollection,
  ): Promise<ExecutionProgress> {
    const collection = this.unwrap(dto);
    if (!collection.tasks || collection.tasks.length === 0) {
      return this.publisher.publish(
        this.monitor.create(collection),
        collection,
        { dispatchWaves: 0, empty: true },
      );
    }

    this.resources.reset();
    let snapshot = this.monitor.create(collection);
    let waves = 0;
    const maxWaves = Math.max(collection.tasks.length * 2, 1);

    while (
      snapshot.pendingTaskIds.length > 0 ||
      snapshot.runningTaskIds.length > 0
    ) {
      if (waves >= maxWaves) {
        throw new ExecutionError(
          'Execution stalled: exceeded maximum dispatch waves',
        );
      }

      const completed = new Set(snapshot.completedTaskIds);
      const failed = new Set(snapshot.failedTaskIds);
      const running = new Set(snapshot.runningTaskIds);

      const ready = this.dependencyResolver.resolveReady(
        collection,
        completed,
        failed,
        running,
      );

      // Cancel tasks blocked by failed dependencies
      for (const task of collection.tasks) {
        if (completed.has(task.id) || failed.has(task.id)) continue;
        if (running.has(task.id)) continue;
        const blocked = task.dependencyIds.some((depId) => failed.has(depId));
        if (blocked) {
          snapshot = this.monitor.markFailed(
            snapshot,
            task.id,
            'Blocked by failed dependency',
          );
        }
      }

      const refreshedFailed = new Set(snapshot.failedTaskIds);
      const refreshedCompleted = new Set(snapshot.completedTaskIds);
      const refreshedRunning = new Set(snapshot.runningTaskIds);

      const stillReady = this.dependencyResolver.resolveReady(
        collection,
        refreshedCompleted,
        refreshedFailed,
        refreshedRunning,
      );

      const batch = this.concurrency.selectBatch(
        stillReady,
        snapshot.runningTaskIds.length,
      );

      const acquired = [];
      const leases = [];
      for (const task of batch) {
        const lease = this.resources.tryAcquire(task);
        if (!lease) break;
        acquired.push(task);
        leases.push(lease);
      }

      if (acquired.length === 0) {
        if (snapshot.runningTaskIds.length === 0 && stillReady.length === 0) {
          // Remaining pending tasks are not runnable (e.g. only failed path left)
          for (const pendingId of snapshot.pendingTaskIds) {
            snapshot = this.monitor.markFailed(
              snapshot,
              pendingId,
              'Unreachable or blocked',
            );
          }
          break;
        }
        if (snapshot.runningTaskIds.length === 0 && stillReady.length > 0) {
          throw new ExecutionError(
            'Insufficient resources to acquire any ready task',
          );
        }
        break;
      }

      waves += 1;
      snapshot = this.monitor.markRunning(
        snapshot,
        acquired.map((t) => t.id),
      );

      const results = await this.dispatcher.dispatch(acquired);

      for (let i = 0; i < results.length; i++) {
        const result = results[i]!;
        const lease = leases[i]!;
        this.resources.release(lease);
        snapshot = result.success
          ? this.monitor.markCompleted(snapshot, result.taskId)
          : this.monitor.markFailed(snapshot, result.taskId, result.error);
      }
    }

    return this.publisher.publish(snapshot, collection, {
      dispatchWaves: waves,
      cpuAvailable: this.resources.snapshot().cpuAvailable,
      memoryMbAvailable: this.resources.snapshot().memoryMbAvailable,
    });
  }

  private unwrap(
    dto: ExecuteTasksDto | ExecutableTaskCollection,
  ): ExecutableTaskCollection {
    if (!dto || typeof dto !== 'object') {
      throw new ExecutionError('ExecutableTaskCollection is required');
    }
    if ('executableTaskCollection' in dto) {
      if (!dto.executableTaskCollection) {
        throw new ExecutionError('ExecutableTaskCollection is required');
      }
      return dto.executableTaskCollection;
    }
    return dto;
  }
}
