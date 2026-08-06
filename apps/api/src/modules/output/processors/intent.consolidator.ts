import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionBlueprint } from '../../planning/models/execution-blueprint.models';
import type { IIntentConsolidator } from '../contracts/output.contracts';
import type { BuildOutputInputDto } from '../dto/build-output-input.dto';
import type { IntentContext, IntentPriority } from '../models/execution-intent.models';

/**
 * Intent Consolidator — merge blueprint fields into IntentContext.
 * Never modifies planning logic.
 */
@Injectable()
export class IntentConsolidator implements IIntentConsolidator {
  constructor(private readonly config: ConfigService) {}

  consolidate(blueprint: ExecutionBlueprint, input: BuildOutputInputDto): IntentContext {
    if (!blueprint || typeof blueprint !== 'object') {
      throw new Error('ExecutionBlueprint is required');
    }
    if (!blueprint.requestId) {
      throw new Error('ExecutionBlueprint.requestId is required');
    }
    if (!blueprint.goal) {
      throw new Error('ExecutionBlueprint.goal is required');
    }
    if (!blueprint.strategy?.strategyId) {
      throw new Error('ExecutionBlueprint.strategy is required');
    }
    if (!Array.isArray(blueprint.tasks) || blueprint.tasks.length === 0) {
      throw new Error('ExecutionBlueprint.tasks must be non-empty');
    }

    const priority = this.resolvePriority(blueprint, input);

    return Object.freeze({
      requestId: blueprint.requestId,
      userId: blueprint.userId,
      organizationId: blueprint.organizationId,
      goal: blueprint.goal,
      strategy: blueprint.strategy,
      objectives: blueprint.objectives,
      tasks: blueprint.tasks,
      dependencyGraph: blueprint.dependencyGraph,
      constraints: blueprint.constraints,
      successCriteria: blueprint.successCriteria,
      failureCriteria: blueprint.failureCriteria,
      priority,
      blueprintMetadata: Object.freeze({
        schemaVersion: blueprint.metadata.schemaVersion,
        plannedAt: blueprint.metadata.plannedAt,
        taskCount: blueprint.metadata.taskCount,
        groupCount: blueprint.metadata.groupCount,
        edgeCount: blueprint.metadata.edgeCount,
        commitmentLevel: blueprint.metadata.commitmentLevel,
        approvalRequired: blueprint.metadata.approvalRequired,
        ...blueprint.metadata.extras,
      }),
      consolidatedAt: new Date().toISOString(),
    });
  }

  private resolvePriority(
    blueprint: ExecutionBlueprint,
    input: BuildOutputInputDto,
  ): IntentPriority {
    if (input.outputHints?.priority) return input.outputHints.priority;
    const fromObjectives = blueprint.objectives.some((o) => o.priority === 'critical')
      ? 'critical'
      : blueprint.objectives.some((o) => o.priority === 'high')
        ? 'high'
        : undefined;
    if (fromObjectives) return fromObjectives;
    if (blueprint.metadata.approvalRequired) return 'high';
    return this.config.output.defaultPriority;
  }
}
