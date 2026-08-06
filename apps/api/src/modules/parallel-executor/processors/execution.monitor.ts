import { Injectable } from '@nestjs/common';
import type { ExecutableTaskCollection } from '../../task-manager/models/task.models';
import type { IExecutionMonitor } from '../contracts';
import type {
  ExecutionSnapshot,
  MonitoredTask,
} from '../models/execution.models';

/**
 * Execution Monitor — ephemeral progress tracking only.
 * No durable state ownership. No retry/recovery.
 */
@Injectable()
export class ExecutionMonitor implements IExecutionMonitor {
  create(collection: ExecutableTaskCollection): ExecutionSnapshot {
    const tasks: MonitoredTask[] = collection.tasks.map((task) =>
      Object.freeze({
        taskId: task.id,
        state: 'WAITING' as const,
      }),
    );
    return this.freezeSnapshot({
      workflowId: collection.workflowId,
      tasks,
      completedTaskIds: [],
      runningTaskIds: [],
      pendingTaskIds: tasks.map((t) => t.taskId),
      failedTaskIds: [],
      cancelledTaskIds: [],
    });
  }

  markRunning(
    snapshot: ExecutionSnapshot,
    taskIds: readonly string[],
  ): ExecutionSnapshot {
    const running = new Set(taskIds);
    const tasks = snapshot.tasks.map((t) => {
      if (!running.has(t.taskId)) return t;
      if (t.state === 'COMPLETED' || t.state === 'FAILED' || t.state === 'CANCELLED') {
        return t;
      }
      return Object.freeze({ ...t, state: 'RUNNING' as const });
    });
    return this.rebuild(snapshot.workflowId, tasks);
  }

  markCompleted(
    snapshot: ExecutionSnapshot,
    taskId: string,
  ): ExecutionSnapshot {
    const tasks = snapshot.tasks.map((t) =>
      t.taskId === taskId
        ? Object.freeze({ taskId, state: 'COMPLETED' as const })
        : t,
    );
    return this.rebuild(snapshot.workflowId, tasks);
  }

  markFailed(
    snapshot: ExecutionSnapshot,
    taskId: string,
    error?: string,
  ): ExecutionSnapshot {
    const tasks = snapshot.tasks.map((t) =>
      t.taskId === taskId
        ? Object.freeze({ taskId, state: 'FAILED' as const, error })
        : t,
    );
    return this.rebuild(snapshot.workflowId, tasks);
  }

  private rebuild(
    workflowId: string,
    tasks: readonly MonitoredTask[],
  ): ExecutionSnapshot {
    return this.freezeSnapshot({
      workflowId,
      tasks,
      completedTaskIds: tasks
        .filter((t) => t.state === 'COMPLETED')
        .map((t) => t.taskId),
      runningTaskIds: tasks
        .filter((t) => t.state === 'RUNNING')
        .map((t) => t.taskId),
      pendingTaskIds: tasks
        .filter((t) => t.state === 'WAITING')
        .map((t) => t.taskId),
      failedTaskIds: tasks
        .filter((t) => t.state === 'FAILED')
        .map((t) => t.taskId),
      cancelledTaskIds: tasks
        .filter((t) => t.state === 'CANCELLED')
        .map((t) => t.taskId),
    });
  }

  private freezeSnapshot(s: {
    workflowId: string;
    tasks: readonly MonitoredTask[];
    completedTaskIds: readonly string[];
    runningTaskIds: readonly string[];
    pendingTaskIds: readonly string[];
    failedTaskIds: readonly string[];
    cancelledTaskIds: readonly string[];
  }): ExecutionSnapshot {
    return Object.freeze({
      workflowId: s.workflowId,
      tasks: Object.freeze([...s.tasks]),
      completedTaskIds: Object.freeze([...s.completedTaskIds]),
      runningTaskIds: Object.freeze([...s.runningTaskIds]),
      pendingTaskIds: Object.freeze([...s.pendingTaskIds]),
      failedTaskIds: Object.freeze([...s.failedTaskIds]),
      cancelledTaskIds: Object.freeze([...s.cancelledTaskIds]),
    });
  }
}
