import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IExecutableWorkflowBuilder } from '../contracts';
import type {
  ExecutableWorkflow,
  ExecutionStrategy,
  WorkflowContext,
  WorkflowDraft,
  WorkflowGraph,
  WorkflowTaskSpec,
} from '../models/workflow.models';

/**
 * Executable Workflow Builder — assemble immutable ExecutableWorkflow.
 */
@Injectable()
export class ExecutableWorkflowBuilder implements IExecutableWorkflowBuilder {
  build(
    draft: WorkflowDraft,
    graph: WorkflowGraph,
    strategy: ExecutionStrategy,
    context: WorkflowContext,
  ): ExecutableWorkflow {
    const tasks: WorkflowTaskSpec[] = graph.topologicalOrder.map((nodeId, index) => {
      const node = graph.nodes.find((n) => n.id === nodeId)!;
      return Object.freeze({
        id: `task:${nodeId}`,
        nodeId,
        title: node.title,
        kind: node.kind,
        dependsOn: Object.freeze([...(graph.reverseAdjacency[nodeId] ?? [])]),
        order: index,
      });
    });

    return Object.freeze({
      id: randomUUID(),
      workflowGraph: graph,
      executionStrategy: strategy,
      tasks: Object.freeze(tasks),
      context,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        goal: draft.goal,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        strategyKind: strategy.kind,
        extras: Object.freeze({
          requestId: draft.requestId,
          priority: draft.priority,
          capabilityCount: draft.capabilityNames.length,
        }),
      }),
      traceId: context.traceId,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
    });
  }
}
