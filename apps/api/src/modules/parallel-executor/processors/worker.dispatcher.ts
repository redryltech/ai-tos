import { Inject, Injectable } from '@nestjs/common';
import type { ExecutableTask } from '../../task-manager/models/task.models';
import {
  WORKER_ADAPTER,
  type IWorkerAdapter,
  type IWorkerDispatcher,
} from '../contracts';
import type { WorkerResult } from '../models/execution.models';

/**
 * Worker Dispatcher — hand off ready tasks to abstract workers.
 * NEVER executes business logic itself.
 */
@Injectable()
export class WorkerDispatcher implements IWorkerDispatcher {
  constructor(
    @Inject(WORKER_ADAPTER) private readonly worker: IWorkerAdapter,
  ) {}

  async dispatch(
    tasks: readonly ExecutableTask[],
  ): Promise<readonly WorkerResult[]> {
    if (tasks.length === 0) return Object.freeze([]);
    const results = await Promise.all(tasks.map((task) => this.worker.run(task)));
    return Object.freeze(results);
  }
}
