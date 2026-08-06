import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IExecutionStrategyBuilder } from '../contracts';
import type {
  ExecutionStrategy,
  ExecutionStrategyKind,
  WorkflowDraft,
  WorkflowGraph,
} from '../models/workflow.models';

/**
 * Execution Strategy Builder — define strategy only; never executes.
 */
@Injectable()
export class ExecutionStrategyBuilder implements IExecutionStrategyBuilder {
  constructor(private readonly config: ConfigService) {}

  build(draft: WorkflowDraft, graph: WorkflowGraph): ExecutionStrategy {
    const fanOutNodes = graph.nodes
      .filter((n) => (graph.adjacency[n.id] ?? []).length > 1)
      .map((n) => n.id);
    const fanInNodes = graph.nodes
      .filter((n) => (graph.reverseAdjacency[n.id] ?? []).length > 1)
      .map((n) => n.id);

    const parallelGroups = this.computeParallelGroups(graph);
    const sequentialChains = this.computeSequentialChains(graph);
    const conditionalGates = draft.constraints
      .filter((c) => /conditional|if\b|when\b/i.test(c))
      .map((_, i) => `gate-${i}`);

    const kind = this.resolveKind({
      nodeCount: draft.nodes.length,
      edgeCount: graph.edges.length,
      parallelGroups,
      sequentialChains,
      fanOutNodes,
      fanInNodes,
      conditionalGates,
    });

    const maxConcurrency =
      kind === 'sequential'
        ? 1
        : Math.max(1, ...parallelGroups.map((g) => g.length), fanOutNodes.length || 1);

    return Object.freeze({
      kind,
      parallelGroups: Object.freeze(parallelGroups.map((g) => Object.freeze([...g]))),
      sequentialChains: Object.freeze(
        sequentialChains.map((c) => Object.freeze([...c])),
      ),
      fanOutNodes: Object.freeze(fanOutNodes),
      fanInNodes: Object.freeze(fanInNodes),
      conditionalGates: Object.freeze(conditionalGates),
      maxConcurrency,
      summary: `${kind} strategy with ${draft.nodes.length} nodes and ${graph.edges.length} edges`,
    });
  }

  private resolveKind(input: {
    nodeCount: number;
    edgeCount: number;
    parallelGroups: string[][];
    sequentialChains: string[][];
    fanOutNodes: string[];
    fanInNodes: string[];
    conditionalGates: string[];
  }): ExecutionStrategyKind {
    if (input.conditionalGates.length > 0) return 'conditional';
    if (input.fanOutNodes.length > 0 && input.fanInNodes.length === 0) return 'fan_out';
    if (input.fanInNodes.length > 0 && input.fanOutNodes.length === 0) return 'fan_in';
    if (input.edgeCount === 0 && input.nodeCount > 1) return 'parallel';
    if (
      input.sequentialChains.length === 1 &&
      input.sequentialChains[0]?.length === input.nodeCount &&
      input.parallelGroups.every((g) => g.length <= 1)
    ) {
      return 'sequential';
    }
    if (
      input.parallelGroups.some((g) => g.length > 1) &&
      input.sequentialChains.some((c) => c.length > 1)
    ) {
      return 'hybrid';
    }
    return this.config.workflow.defaultStrategy;
  }

  private computeParallelGroups(graph: WorkflowGraph): string[][] {
    const levels: string[][] = [];
    const remaining = new Set(graph.nodes.map((n) => n.id));
    const done = new Set<string>();

    while (remaining.size > 0) {
      const ready = [...remaining].filter((id) =>
        (graph.reverseAdjacency[id] ?? []).every((p) => done.has(p)),
      );
      if (ready.length === 0) break;
      levels.push(ready);
      for (const id of ready) {
        remaining.delete(id);
        done.add(id);
      }
    }
    return levels;
  }

  private computeSequentialChains(graph: WorkflowGraph): string[][] {
    const chains: string[][] = [];
    const visited = new Set<string>();
    for (const root of graph.roots) {
      const chain: string[] = [];
      let current: string | undefined = root;
      while (current && !visited.has(current)) {
        visited.add(current);
        chain.push(current);
        const next: readonly string[] = graph.adjacency[current] ?? [];
        current = next.length === 1 ? next[0] : undefined;
      }
      if (chain.length > 0) chains.push(chain);
    }
    return chains;
  }
}
