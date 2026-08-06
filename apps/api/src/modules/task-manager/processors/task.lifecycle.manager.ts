import { Injectable } from '@nestjs/common';
import type { ITaskLifecycleManager } from '../contracts';
import type {
  LifecycleTask,
  TaskDependencyGraph,
  TaskDraft,
  TaskLifecycleState,
} from '../models/task.models';

/**
 * Task Lifecycle Manager — assign initial runtime states only.
 * Owns CREATED → WAITING | READY. No retry/recovery/execution.
 */
@Injectable()
export class TaskLifecycleManager implements ITaskLifecycleManager {
  initialize(
    drafts: readonly TaskDraft[],
    graph: TaskDependencyGraph,
  ): readonly LifecycleTask[] {
    const source = graph.drafts.length > 0 ? graph.drafts : drafts;
    const byId = new Map(source.map((d) => [d.id, d]));

    const lifecycle = graph.topologicalOrder.map((id) => {
      const draft = byId.get(id)!;
      const state: TaskLifecycleState =
        draft.dependencyIds.length === 0 ? 'READY' : 'WAITING';
      return Object.freeze({
        draft: Object.freeze({
          ...draft,
          metadata: Object.freeze({
            ...draft.metadata,
            initialState: 'CREATED',
            lifecycleState: state,
          }),
        }),
        state,
      });
    });

    return Object.freeze(lifecycle);
  }
}
