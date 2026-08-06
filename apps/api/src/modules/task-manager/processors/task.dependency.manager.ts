import { Injectable } from '@nestjs/common';
import type { ITaskDependencyManager } from '../contracts';
import type { TaskDependencyGraph, TaskDraft } from '../models/task.models';
import { TaskValidationError } from '../models/task.models';

/**
 * Task Dependency Manager — build/validate task dependency graph.
 * Does not manage lifecycle or dispatch.
 */
@Injectable()
export class TaskDependencyManager implements ITaskDependencyManager {
  build(drafts: readonly TaskDraft[]): TaskDependencyGraph {
    const byId = new Map<string, TaskDraft>();
    const byNodeId = new Map<string, TaskDraft>();
    const bySourceId = new Map<string, TaskDraft>();

    for (const draft of drafts) {
      if (byId.has(draft.id)) {
        throw new TaskValidationError(`Duplicate task id: ${draft.id}`);
      }
      byId.set(draft.id, draft);
      if (byNodeId.has(draft.nodeId)) {
        throw new TaskValidationError(`Duplicate nodeId: ${draft.nodeId}`);
      }
      byNodeId.set(draft.nodeId, draft);
      const sourceTaskId = draft.metadata.sourceTaskId;
      if (typeof sourceTaskId === 'string') {
        bySourceId.set(sourceTaskId, draft);
      }
    }

    const remapped: TaskDraft[] = drafts.map((draft) => {
      const resolved = draft.dependencyIds.map((depRef) => {
        const dep =
          byId.get(depRef) ?? byNodeId.get(depRef) ?? bySourceId.get(depRef);
        if (!dep) {
          throw new TaskValidationError(
            `Invalid dependency reference "${depRef}" on task ${draft.id}`,
          );
        }
        if (dep.id === draft.id) {
          throw new TaskValidationError(
            `Self-dependency detected on task ${draft.id}`,
          );
        }
        return dep.id;
      });
      return Object.freeze({
        ...draft,
        dependencyIds: Object.freeze(resolved),
      });
    });

    const edges: Record<string, string[]> = {};
    const reverseEdges: Record<string, string[]> = {};
    for (const draft of remapped) {
      edges[draft.id] = [];
      reverseEdges[draft.id] = [...draft.dependencyIds];
    }
    for (const draft of remapped) {
      for (const depId of draft.dependencyIds) {
        edges[depId]!.push(draft.id);
      }
    }

    const topologicalOrder = this.topologicalOrder(remapped, reverseEdges);
    const roots = remapped
      .filter((d) => d.dependencyIds.length === 0)
      .map((d) => d.id);

    return Object.freeze({
      drafts: Object.freeze(remapped),
      taskIds: Object.freeze(remapped.map((d) => d.id)),
      edges: Object.freeze(
        Object.fromEntries(
          Object.entries(edges).map(([k, v]) => [k, Object.freeze([...v])]),
        ),
      ),
      reverseEdges: Object.freeze(
        Object.fromEntries(
          Object.entries(reverseEdges).map(([k, v]) => [
            k,
            Object.freeze([...v]),
          ]),
        ),
      ),
      roots: Object.freeze(roots),
      topologicalOrder: Object.freeze(topologicalOrder),
    });
  }

  private topologicalOrder(
    drafts: readonly TaskDraft[],
    reverseEdges: Record<string, readonly string[]>,
  ): string[] {
    const remaining = new Set(drafts.map((d) => d.id));
    const done = new Set<string>();
    const order: string[] = [];

    while (remaining.size > 0) {
      const ready = [...remaining].filter((id) =>
        (reverseEdges[id] ?? []).every((dep) => done.has(dep)),
      );
      if (ready.length === 0) {
        throw new TaskValidationError(
          'Cyclic dependencies detected in task graph',
        );
      }
      ready.sort();
      for (const id of ready) {
        remaining.delete(id);
        done.add(id);
        order.push(id);
      }
    }
    return order;
  }
}
