import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { IEventStreamManager } from '../contracts';
import type { StreamEvent } from '../models/streaming.models';
import { StreamingError } from '../models/streaming.models';

/**
 * Event Stream Manager — publish workflow/task/lifecycle events.
 * Never executes or finalizes.
 */
@Injectable()
export class EventStreamManager implements IEventStreamManager {
  build(progress: ExecutionProgress): readonly StreamEvent[] {
    if (!progress || typeof progress !== 'object') {
      throw new StreamingError('ExecutionProgress is required');
    }
    const now = new Date().toISOString();
    const events: StreamEvent[] = [
      Object.freeze({
        id: randomUUID(),
        kind: 'workflow' as const,
        topic: 'workflow.progress',
        payload: Object.freeze({
          workflowId: progress.workflowId,
          progressPercentage: progress.progressPercentage,
        }),
        timestamp: now,
      }),
      Object.freeze({
        id: randomUUID(),
        kind: 'lifecycle' as const,
        topic: 'execution.lifecycle',
        payload: Object.freeze({
          completedTasks: progress.completedTasks,
          runningTasks: progress.runningTasks,
          pendingTasks: progress.pendingTasks,
          failedTasks: progress.failedTasks,
        }),
        timestamp: now,
      }),
    ];

    for (const taskId of progress.metadata.completedTaskIds ?? []) {
      events.push(
        Object.freeze({
          id: randomUUID(),
          kind: 'task' as const,
          topic: 'task.completed',
          payload: Object.freeze({ taskId, status: 'COMPLETED' }),
          timestamp: now,
        }),
      );
    }
    for (const taskId of progress.metadata.failedTaskIds ?? []) {
      events.push(
        Object.freeze({
          id: randomUUID(),
          kind: 'task' as const,
          topic: 'task.failed',
          payload: Object.freeze({ taskId, status: 'FAILED' }),
          timestamp: now,
        }),
      );
    }

    return Object.freeze(events);
  }
}
