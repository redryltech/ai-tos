import { Injectable } from '@nestjs/common';
import type { ExecutionIntent } from '../../output/models/execution-intent.models';
import type { IWorkflowContextManager } from '../contracts';
import type { WorkflowContext } from '../models/workflow.models';

/**
 * Workflow Context Manager — build immutable compile-time context snapshot.
 * Never mutates after creation. Never manages runtime state.
 */
@Injectable()
export class WorkflowContextManager implements IWorkflowContextManager {
  build(intent: ExecutionIntent): WorkflowContext {
    const extras = intent.metadata?.extras ?? {};
    const policyReferences = this.asStringList(extras.policyReferences);
    const memoryReferences = this.asStringList(extras.memoryReferences);
    const knowledgeReferences = this.asStringList(extras.knowledgeReferences);
    const variables = this.parseVariables(extras.variables);

    return Object.freeze({
      executionIntent: intent,
      traceId: intent.traceId,
      requestId: intent.requestId,
      userId: intent.userId,
      organizationId: intent.organizationId,
      metadata: Object.freeze({
        schemaVersion: intent.metadata.schemaVersion,
        builtAt: intent.metadata.builtAt,
        transitionReady: intent.metadata.transitionReady,
        executionReady: intent.metadata.executionReady,
        capabilityCount: intent.metadata.capabilityCount,
        taskCount: intent.metadata.taskCount,
      }),
      variables: Object.freeze({
        goal: intent.goal,
        priority: intent.priority,
        ...variables,
      }),
      policyReferences: Object.freeze(policyReferences),
      memoryReferences: Object.freeze(memoryReferences),
      knowledgeReferences: Object.freeze(knowledgeReferences),
    });
  }

  private asStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((v): v is string => typeof v === 'string');
    }
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  private parseVariables(
    value: unknown,
  ): Record<string, string | number | boolean | null> {
    if (typeof value === 'string' && value.trim()) {
      try {
        return this.asVariableMap(JSON.parse(value) as unknown);
      } catch {
        return {};
      }
    }
    return this.asVariableMap(value);
  }

  private asVariableMap(
    value: unknown,
  ): Record<string, string | number | boolean | null> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    const out: Record<string, string | number | boolean | null> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        v === null
      ) {
        out[k] = v;
      }
    }
    return out;
  }
}
