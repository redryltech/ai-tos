import { Injectable } from '@nestjs/common';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { IProgressStreamManager } from '../contracts';
import type { StreamProgressSnapshot } from '../models/streaming.models';

/**
 * Progress Stream Manager — publish execution progress updates.
 */
@Injectable()
export class ProgressStreamManager implements IProgressStreamManager {
  build(progress: ExecutionProgress): StreamProgressSnapshot {
    return Object.freeze({
      completedTasks: progress.completedTasks,
      runningTasks: progress.runningTasks,
      pendingTasks: progress.pendingTasks,
      failedTasks: progress.failedTasks,
      progressPercentage: progress.progressPercentage,
    });
  }
}
