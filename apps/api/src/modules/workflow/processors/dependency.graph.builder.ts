import { Injectable } from '@nestjs/common';
import type { ExecutionIntent } from '../../output/models/execution-intent.models';
import type { IDependencyGraphBuilder } from '../contracts';
import type {
  WorkflowDraft,
  WorkflowEdge,
  WorkflowGraph,
} from '../models/workflow.models';

/**
 * Dependency Graph Builder — construct DAG from draft + intent edges.
 * Never validates business rules.
 */
@Injectable()
export class DependencyGraphBuilder implements IDependencyGraphBuilder {
  build(draft: WorkflowDraft, intent: ExecutionIntent): WorkflowGraph {
    const nodeIds = new Set(draft.nodes.map((n) => n.id));
    const edges: WorkflowEdge[] = [];

    for (const edge of intent.dependencyGraph?.edges ?? []) {
      if (!nodeIds.has(edge.fromTaskId) || !nodeIds.has(edge.toTaskId)) {
        continue;
      }
      edges.push(
        Object.freeze({
          id: edge.id,
          fromNodeId: edge.fromTaskId,
          toNodeId: edge.toTaskId,
          type: edge.type,
        }),
      );
    }

    const adjacency: Record<string, string[]> = {};
    const reverseAdjacency: Record<string, string[]> = {};
    for (const node of draft.nodes) {
      adjacency[node.id] = [];
      reverseAdjacency[node.id] = [];
    }
    for (const edge of edges) {
      adjacency[edge.fromNodeId]!.push(edge.toNodeId);
      reverseAdjacency[edge.toNodeId]!.push(edge.fromNodeId);
    }

    const roots = draft.nodes
      .filter((n) => (reverseAdjacency[n.id] ?? []).length === 0)
      .map((n) => n.id);
    const leaves = draft.nodes
      .filter((n) => (adjacency[n.id] ?? []).length === 0)
      .map((n) => n.id);

    const topologicalOrder = this.topoSort(
      draft.nodes.map((n) => n.id),
      adjacency,
      reverseAdjacency,
    );

    return Object.freeze({
      nodes: draft.nodes,
      edges: Object.freeze(edges),
      adjacency: Object.freeze(
        Object.fromEntries(
          Object.entries(adjacency).map(([k, v]) => [k, Object.freeze([...v])]),
        ),
      ),
      reverseAdjacency: Object.freeze(
        Object.fromEntries(
          Object.entries(reverseAdjacency).map(([k, v]) => [
            k,
            Object.freeze([...v]),
          ]),
        ),
      ),
      roots: Object.freeze(roots),
      leaves: Object.freeze(leaves),
      topologicalOrder: Object.freeze(topologicalOrder),
    });
  }

  private topoSort(
    nodeIds: readonly string[],
    adjacency: Record<string, string[]>,
    reverse: Record<string, string[]>,
  ): string[] {
    const indegree: Record<string, number> = {};
    for (const id of nodeIds) {
      indegree[id] = (reverse[id] ?? []).length;
    }
    const queue = nodeIds.filter((id) => indegree[id] === 0);
    const order: string[] = [];
    while (queue.length > 0) {
      const id = queue.shift()!;
      order.push(id);
      for (const next of adjacency[id] ?? []) {
        indegree[next] = (indegree[next] ?? 0) - 1;
        if (indegree[next] === 0) queue.push(next);
      }
    }
    return order;
  }
}
