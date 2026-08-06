import { Injectable } from '@nestjs/common';
import type { ExecutionIntent } from '../../output/models/execution-intent.models';
import type { IWorkflowBuilder } from '../contracts';
import type {
  WorkflowDraft,
  WorkflowNode,
  WorkflowObjective,
} from '../models/workflow.models';

/**
 * Workflow Builder — ExecutionIntent → WorkflowDraft.
 * Never builds dependency graph.
 */
@Injectable()
export class WorkflowBuilder implements IWorkflowBuilder {
  build(intent: ExecutionIntent): WorkflowDraft {
    const capabilityNames = Object.freeze([...(intent.capabilities?.names ?? [])]);
    const nodes: WorkflowNode[] = intent.tasks.map((task) =>
      Object.freeze({
        id: task.id,
        title: task.title,
        description: task.description,
        kind: task.kind,
        order: task.order,
        groupId: task.groupId,
        parentNodeId: task.parentTaskId,
        capabilityHints: capabilityNames,
        metadata: Object.freeze({
          milestoneId: task.milestoneId ?? null,
        }),
      }),
    );

    const objectives: WorkflowObjective[] = intent.objectives.map((o) =>
      Object.freeze({
        id: o.id,
        description: o.description,
        priority: o.priority,
      }),
    );

    return Object.freeze({
      requestId: intent.requestId,
      goal: intent.goal,
      objectives: Object.freeze(objectives),
      nodes: Object.freeze(nodes),
      sourceTaskIds: Object.freeze(intent.tasks.map((t) => t.id)),
      capabilityNames,
      constraints: Object.freeze([...(intent.constraints ?? [])]),
      successCriteria: Object.freeze([...(intent.successCriteria ?? [])]),
      failureCriteria: Object.freeze([...(intent.failureCriteria ?? [])]),
      priority: intent.priority,
      metadata: Object.freeze({
        schemaVersion: intent.metadata.schemaVersion,
        transitionReady: intent.metadata.transitionReady,
        executionReady: intent.metadata.executionReady,
        capabilityCount: intent.metadata.capabilityCount,
        taskCount: intent.metadata.taskCount,
        ...(intent.metadata.extras ?? {}),
      }),
    });
  }
}
