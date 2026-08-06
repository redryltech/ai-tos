/** Planning Engine domain models (Layer 3.4). Immutable typed contracts. */

export type PlanTaskKind = 'prepare' | 'validate' | 'execute' | 'verify' | 'finalize';

export interface PlanObjective {
  readonly id: string;
  readonly description: string;
  readonly priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface PlanMilestone {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly order: number;
}

export interface StrategyPlan {
  readonly strategyId: string;
  readonly name: string;
  readonly summary: string;
  readonly selectedActionId: string;
  readonly selectedActionTitle: string;
  readonly objectives: readonly PlanObjective[];
  readonly milestones: readonly PlanMilestone[];
  readonly successCriteria: readonly string[];
  readonly failureCriteria: readonly string[];
  readonly constraints: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface PlanTask {
  readonly id: string;
  readonly groupId: string;
  readonly parentTaskId?: string;
  readonly kind: PlanTaskKind;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly milestoneId?: string;
}

export interface TaskGroup {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly taskIds: readonly string[];
}

export interface TaskPlan {
  readonly tasks: readonly PlanTask[];
  readonly groups: readonly TaskGroup[];
  readonly logicalOrder: readonly string[];
}

export interface DependencyEdge {
  readonly id: string;
  readonly fromTaskId: string;
  readonly toTaskId: string;
  readonly type: 'prerequisite' | 'sequence' | 'constraint';
}

export interface DependencyGraph {
  readonly edges: readonly DependencyEdge[];
  readonly prerequisites: Readonly<Record<string, readonly string[]>>;
  readonly parallelGroups: readonly (readonly string[])[];
  readonly sequentialChains: readonly (readonly string[])[];
  readonly executionConstraints: readonly string[];
}

/** Canonical Planning Engine output — identical structure for every request. */
export interface ExecutionBlueprint {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly goal: string;
  readonly strategy: StrategyPlan;
  readonly objectives: readonly PlanObjective[];
  readonly milestones: readonly PlanMilestone[];
  readonly tasks: readonly PlanTask[];
  readonly dependencyGraph: DependencyGraph;
  readonly constraints: readonly string[];
  readonly successCriteria: readonly string[];
  readonly failureCriteria: readonly string[];
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    plannedAt: string;
    taskCount: number;
    groupCount: number;
    edgeCount: number;
    commitmentLevel: string;
    approvalRequired: boolean;
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
}
