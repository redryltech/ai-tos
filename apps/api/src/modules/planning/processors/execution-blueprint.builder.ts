import { Injectable } from '@nestjs/common';
import type { Decision } from '../../decision/models/decision.models';
import type { IExecutionBlueprintBuilder } from '../contracts/planning.contracts';
import type {
  DependencyGraph,
  ExecutionBlueprint,
  StrategyPlan,
  TaskPlan,
} from '../models/execution-blueprint.models';

/**
 * Execution Blueprint Builder — assemble immutable canonical ExecutionBlueprint.
 */
@Injectable()
export class ExecutionBlueprintBuilder implements IExecutionBlueprintBuilder {
  build(
    decision: Decision,
    strategy: StrategyPlan,
    taskPlan: TaskPlan,
    dependencyGraph: DependencyGraph,
  ): ExecutionBlueprint {
    const blueprint: ExecutionBlueprint = Object.freeze({
      requestId: decision.requestId,
      userId: decision.userId,
      organizationId: decision.organizationId,
      goal: decision.goal,
      strategy,
      objectives: strategy.objectives,
      milestones: strategy.milestones,
      tasks: taskPlan.tasks,
      dependencyGraph,
      constraints: Object.freeze([
        ...strategy.constraints,
        ...dependencyGraph.executionConstraints.filter(
          (c) => !strategy.constraints.includes(c),
        ),
      ]),
      successCriteria: strategy.successCriteria,
      failureCriteria: strategy.failureCriteria,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        plannedAt: new Date().toISOString(),
        taskCount: taskPlan.tasks.length,
        groupCount: taskPlan.groups.length,
        edgeCount: dependencyGraph.edges.length,
        commitmentLevel: decision.commitmentLevel,
        approvalRequired: decision.approvalRequired,
        extras: Object.freeze({
          strategyId: strategy.strategyId,
          selectedActionId: strategy.selectedActionId,
          selectedActionTitle: strategy.selectedActionTitle,
          logicalOrderCount: taskPlan.logicalOrder.length,
          parallelGroupCount: dependencyGraph.parallelGroups.length,
          sequentialChainCount: dependencyGraph.sequentialChains.length,
          decisionConfidence: decision.confidence,
        }),
      }),
    });

    this.assertShape(blueprint);
    return blueprint;
  }

  private assertShape(blueprint: ExecutionBlueprint): void {
    if (!blueprint.requestId) throw new Error('ExecutionBlueprint.requestId is required');
    if (!blueprint.goal) throw new Error('ExecutionBlueprint.goal is required');
    if (!blueprint.strategy?.strategyId) {
      throw new Error('ExecutionBlueprint.strategy is required');
    }
    if (!Array.isArray(blueprint.objectives)) {
      throw new Error('ExecutionBlueprint.objectives must be an array');
    }
    if (!Array.isArray(blueprint.milestones)) {
      throw new Error('ExecutionBlueprint.milestones must be an array');
    }
    if (!Array.isArray(blueprint.tasks) || blueprint.tasks.length === 0) {
      throw new Error('ExecutionBlueprint.tasks must be a non-empty array');
    }
    if (!blueprint.dependencyGraph || !Array.isArray(blueprint.dependencyGraph.edges)) {
      throw new Error('ExecutionBlueprint.dependencyGraph is required');
    }
    if (!Array.isArray(blueprint.constraints)) {
      throw new Error('ExecutionBlueprint.constraints must be an array');
    }
    if (!Array.isArray(blueprint.successCriteria)) {
      throw new Error('ExecutionBlueprint.successCriteria must be an array');
    }
    if (!Array.isArray(blueprint.failureCriteria)) {
      throw new Error('ExecutionBlueprint.failureCriteria must be an array');
    }
    if (!blueprint.metadata || blueprint.metadata.schemaVersion !== '1.0.0') {
      throw new Error('ExecutionBlueprint.metadata.schemaVersion must be 1.0.0');
    }
  }
}
