import { Injectable } from '@nestjs/common';
import type { ITransitionValidator } from '../contracts/output.contracts';
import type { ExecutionIntent } from '../models/execution-intent.models';

/**
 * Transition Validator — validate contract integrity and readiness.
 * Returns validated immutable ExecutionIntent. Never executes.
 */
@Injectable()
export class TransitionValidator implements ITransitionValidator {
  validate(intent: ExecutionIntent): ExecutionIntent {
    if (!intent || typeof intent !== 'object') {
      throw new Error('ExecutionIntent is required');
    }
    if (!intent.requestId) throw new Error('ExecutionIntent.requestId is required');
    if (!intent.goal) throw new Error('ExecutionIntent.goal is required');
    if (!intent.traceId) throw new Error('ExecutionIntent.traceId is required');
    if (!intent.strategy?.strategyId) {
      throw new Error('ExecutionIntent.strategy is required');
    }
    if (!Array.isArray(intent.objectives)) {
      throw new Error('ExecutionIntent.objectives must be an array');
    }
    if (!Array.isArray(intent.tasks) || intent.tasks.length === 0) {
      throw new Error('ExecutionIntent.tasks must be a non-empty array');
    }
    if (!intent.dependencyGraph || !Array.isArray(intent.dependencyGraph.edges)) {
      throw new Error('ExecutionIntent.dependencyGraph is required');
    }
    if (!intent.capabilities?.names?.length) {
      throw new Error('ExecutionIntent.capabilities must be complete');
    }
    if (!intent.capabilities.names.includes('reasoning')) {
      throw new Error('ExecutionIntent requires reasoning capability');
    }
    if (!Array.isArray(intent.constraints)) {
      throw new Error('ExecutionIntent.constraints must be an array');
    }
    if (!Array.isArray(intent.successCriteria) || intent.successCriteria.length === 0) {
      throw new Error('ExecutionIntent.successCriteria must be non-empty');
    }
    if (!Array.isArray(intent.failureCriteria) || intent.failureCriteria.length === 0) {
      throw new Error('ExecutionIntent.failureCriteria must be non-empty');
    }
    if (!intent.priority) throw new Error('ExecutionIntent.priority is required');
    if (!intent.metadata || intent.metadata.schemaVersion !== '1.0.0') {
      throw new Error('ExecutionIntent.metadata.schemaVersion must be 1.0.0');
    }

    const taskIds = new Set(intent.tasks.map((t) => t.id));
    for (const edge of intent.dependencyGraph.edges) {
      if (!taskIds.has(edge.fromTaskId) || !taskIds.has(edge.toTaskId)) {
        throw new Error('ExecutionIntent dependencyGraph references unknown tasks');
      }
    }

    const requiredCaps = intent.capabilities.requirements.filter((r) => r.required);
    if (requiredCaps.length === 0) {
      throw new Error('ExecutionIntent must declare at least one required capability');
    }

    const transitionReady = true;
    const executionReady =
      transitionReady &&
      intent.tasks.length > 0 &&
      intent.capabilities.names.includes('reasoning') &&
      intent.successCriteria.length > 0;

    return Object.freeze({
      requestId: intent.requestId,
      userId: intent.userId,
      organizationId: intent.organizationId,
      goal: intent.goal,
      objectives: intent.objectives,
      strategy: intent.strategy,
      tasks: intent.tasks,
      dependencyGraph: intent.dependencyGraph,
      capabilities: intent.capabilities,
      constraints: intent.constraints,
      successCriteria: intent.successCriteria,
      failureCriteria: intent.failureCriteria,
      priority: intent.priority,
      traceId: intent.traceId,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        builtAt: intent.metadata.builtAt,
        transitionReady,
        executionReady,
        capabilityCount: intent.capabilities.names.length,
        taskCount: intent.tasks.length,
        extras: Object.freeze({
          ...intent.metadata.extras,
          validatedAt: new Date().toISOString(),
        }),
      }),
    });
  }
}
