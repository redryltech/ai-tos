import type { Decision } from '../../decision/models/decision.models';
import type { PlanInputDto } from '../dto/plan-input.dto';
import type {
  DependencyGraph,
  ExecutionBlueprint,
  StrategyPlan,
  TaskPlan,
} from '../models/execution-blueprint.models';

export const STRATEGY_DESIGNER = Symbol('STRATEGY_DESIGNER');
export const TASK_DECOMPOSER = Symbol('TASK_DECOMPOSER');
export const DEPENDENCY_DESIGNER = Symbol('DEPENDENCY_DESIGNER');
export const EXECUTION_BLUEPRINT_BUILDER = Symbol('EXECUTION_BLUEPRINT_BUILDER');
export const PLANNING_SERVICE = Symbol('PLANNING_SERVICE');

export interface IStrategyDesigner {
  design(decision: Decision, input: PlanInputDto): StrategyPlan;
}

export interface ITaskDecomposer {
  decompose(strategy: StrategyPlan, input: PlanInputDto): TaskPlan;
}

export interface IDependencyDesigner {
  design(strategy: StrategyPlan, taskPlan: TaskPlan): DependencyGraph;
}

export interface IExecutionBlueprintBuilder {
  build(
    decision: Decision,
    strategy: StrategyPlan,
    taskPlan: TaskPlan,
    dependencyGraph: DependencyGraph,
  ): ExecutionBlueprint;
}

/** Sole public Planning Engine contract: plan(decision) → ExecutionBlueprint. */
export interface IPlanningService {
  plan(input: Decision | PlanInputDto): Promise<ExecutionBlueprint>;
}
