import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IExecutionContractBuilder } from '../contracts/output.contracts';
import type { BuildOutputInputDto } from '../dto/build-output-input.dto';
import type {
  CapabilityRequirements,
  ExecutionIntent,
  IntentContext,
} from '../models/execution-intent.models';

/**
 * Execution Contract Builder — assemble immutable ExecutionIntent.
 * Does not execute, schedule, or bind providers.
 */
@Injectable()
export class ExecutionContractBuilder implements IExecutionContractBuilder {
  build(
    context: IntentContext,
    capabilities: CapabilityRequirements,
    input: BuildOutputInputDto,
  ): ExecutionIntent {
    const traceId =
      typeof input.outputHints?.traceId === 'string' &&
      input.outputHints.traceId.trim().length > 0
        ? input.outputHints.traceId.trim()
        : randomUUID();

    return Object.freeze({
      requestId: context.requestId,
      userId: context.userId,
      organizationId: context.organizationId,
      goal: context.goal,
      objectives: context.objectives,
      strategy: context.strategy,
      tasks: context.tasks,
      dependencyGraph: context.dependencyGraph,
      capabilities,
      constraints: context.constraints,
      successCriteria: context.successCriteria,
      failureCriteria: context.failureCriteria,
      priority: context.priority,
      traceId,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        builtAt: new Date().toISOString(),
        transitionReady: false,
        executionReady: false,
        capabilityCount: capabilities.names.length,
        taskCount: context.tasks.length,
        extras: Object.freeze({
          ...context.blueprintMetadata,
          consolidatedAt: context.consolidatedAt,
          strategyId: context.strategy.strategyId,
          selectedActionTitle: context.strategy.selectedActionTitle,
          capabilitySummary: capabilities.summary,
        }),
      }),
    });
  }
}
