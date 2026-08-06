import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IWorkflowValidator } from '../contracts';
import type { WorkflowDraft, WorkflowGraph } from '../models/workflow.models';
import { WorkflowValidationError } from '../models/workflow.models';

/**
 * Workflow Validator — structural validation only.
 * Throws WorkflowValidationError on invalid structure.
 */
@Injectable()
export class WorkflowValidator implements IWorkflowValidator {
  constructor(private readonly config: ConfigService) {}

  validate(draft: WorkflowDraft, graph: WorkflowGraph): void {
    if (!draft.nodes.length) {
      if (!this.config.workflow.allowEmpty) {
        throw new WorkflowValidationError('Empty workflow: no nodes');
      }
      return;
    }

    if (draft.nodes.length > this.config.workflow.maxNodes) {
      throw new WorkflowValidationError(
        `Workflow exceeds max nodes (${this.config.workflow.maxNodes})`,
      );
    }

    const ids = draft.nodes.map((n) => n.id);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      throw new WorkflowValidationError('Duplicate workflow nodes detected');
    }

    for (const edge of graph.edges) {
      if (!unique.has(edge.fromNodeId) || !unique.has(edge.toNodeId)) {
        throw new WorkflowValidationError(
          `Invalid dependency reference: ${edge.fromNodeId} → ${edge.toNodeId}`,
        );
      }
    }

    if (graph.topologicalOrder.length !== draft.nodes.length) {
      throw new WorkflowValidationError(
        'Cyclic dependencies detected in workflow graph',
      );
    }

    const reachable = this.reachableFromRoots(graph);
    for (const node of draft.nodes) {
      if (!reachable.has(node.id)) {
        throw new WorkflowValidationError(
          `Unreachable workflow node: ${node.id}`,
        );
      }
    }

    if (!draft.goal || !draft.goal.trim()) {
      throw new WorkflowValidationError('Invalid workflow structure: goal is required');
    }
  }

  private reachableFromRoots(graph: WorkflowGraph): Set<string> {
    const seen = new Set<string>();
    const queue = [...graph.roots];
    if (queue.length === 0 && graph.nodes.length > 0) {
      // Cycle case already caught; treat all as unreachable
      return seen;
    }
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      for (const next of graph.adjacency[id] ?? []) {
        queue.push(next);
      }
    }
    return seen;
  }
}
