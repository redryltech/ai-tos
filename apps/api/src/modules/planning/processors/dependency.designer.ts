import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IDependencyDesigner } from '../contracts/planning.contracts';
import type {
  DependencyEdge,
  DependencyGraph,
  StrategyPlan,
  TaskPlan,
} from '../models/execution-blueprint.models';

/**
 * Dependency Designer — build dependency graph.
 * No scheduling.
 */
@Injectable()
export class DependencyDesigner implements IDependencyDesigner {
  design(strategy: StrategyPlan, taskPlan: TaskPlan): DependencyGraph {
    const edges: DependencyEdge[] = [];
    const prerequisites: Record<string, string[]> = {};

    const ensure = (taskId: string): string[] => {
      if (!prerequisites[taskId]) prerequisites[taskId] = [];
      return prerequisites[taskId]!;
    };

    const addEdge = (
      fromTaskId: string,
      toTaskId: string,
      type: DependencyEdge['type'],
    ): void => {
      edges.push(
        Object.freeze({
          id: randomUUID(),
          fromTaskId,
          toTaskId,
          type,
        }),
      );
      ensure(toTaskId).push(fromTaskId);
    };

    for (const task of taskPlan.tasks) {
      if (task.parentTaskId) {
        addEdge(task.parentTaskId, task.id, 'prerequisite');
      }
    }

    const orderedGroups = [...taskPlan.groups].sort((a, b) => a.order - b.order);
    for (let i = 1; i < orderedGroups.length; i++) {
      const prev = orderedGroups[i - 1]!;
      const curr = orderedGroups[i]!;
      const prevRoots = taskPlan.tasks.filter(
        (t) => t.groupId === prev.id && !t.parentTaskId,
      );
      const currRoots = taskPlan.tasks.filter(
        (t) => t.groupId === curr.id && !t.parentTaskId,
      );
      for (const from of prevRoots) {
        for (const to of currRoots) {
          addEdge(from.id, to.id, 'sequence');
        }
      }
    }

    const preferParallel = strategy.metadata.preferParallel !== false;
    const parallelGroups: string[][] = [];
    const sequentialChains: string[][] = [];

    for (const group of orderedGroups) {
      const groupTasks = taskPlan.tasks
        .filter((t) => t.groupId === group.id)
        .sort((a, b) => a.order - b.order);
      const siblings = groupTasks.filter((t) => t.parentTaskId);
      const roots = groupTasks.filter((t) => !t.parentTaskId);

      if (preferParallel && siblings.length > 1) {
        const byParent = new Map<string, string[]>();
        for (const s of siblings) {
          const key = s.parentTaskId!;
          const list = byParent.get(key) ?? [];
          list.push(s.id);
          byParent.set(key, list);
        }
        for (const ids of byParent.values()) {
          if (ids.length > 1) parallelGroups.push(ids);
        }
      }

      for (const root of roots) {
        const chain = [root.id, ...siblings.filter((s) => s.parentTaskId === root.id).map((s) => s.id)];
        if (chain.length > 1) sequentialChains.push(chain);
      }
    }

    const executionConstraints = Object.freeze([
      ...strategy.constraints,
      'no_runtime_scheduling',
      'no_worker_assignment',
      preferParallel ? 'prefer_parallel_siblings' : 'prefer_sequential_siblings',
    ]);

    const frozenPrereqs: Record<string, readonly string[]> = {};
    for (const [k, v] of Object.entries(prerequisites)) {
      frozenPrereqs[k] = Object.freeze([...new Set(v)]);
    }

    return Object.freeze({
      edges: Object.freeze(edges),
      prerequisites: Object.freeze(frozenPrereqs),
      parallelGroups: Object.freeze(parallelGroups.map((g) => Object.freeze(g))),
      sequentialChains: Object.freeze(sequentialChains.map((c) => Object.freeze(c))),
      executionConstraints,
    });
  }
}
