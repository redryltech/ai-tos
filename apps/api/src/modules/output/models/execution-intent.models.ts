/** Output Engine domain models (Layer 3.5). Immutable typed contracts. */

import type {
  DependencyGraph,
  PlanObjective,
  PlanTask,
  StrategyPlan,
} from '../../planning/models/execution-blueprint.models';

export type CapabilityName =
  | 'reasoning'
  | 'vision'
  | 'speech'
  | 'memory'
  | 'knowledge'
  | 'search'
  | 'tools'
  | 'coding'
  | 'translation'
  | 'image';

export type IntentPriority = 'low' | 'normal' | 'high' | 'critical';

export interface CapabilityRequirement {
  readonly name: CapabilityName;
  readonly reason: string;
  readonly required: boolean;
}

export interface CapabilityRequirements {
  readonly requirements: readonly CapabilityRequirement[];
  readonly names: readonly CapabilityName[];
  readonly summary: string;
}

export interface IntentContext {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly goal: string;
  readonly strategy: StrategyPlan;
  readonly objectives: readonly PlanObjective[];
  readonly tasks: readonly PlanTask[];
  readonly dependencyGraph: DependencyGraph;
  readonly constraints: readonly string[];
  readonly successCriteria: readonly string[];
  readonly failureCriteria: readonly string[];
  readonly priority: IntentPriority;
  readonly blueprintMetadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly consolidatedAt: string;
}

/** Canonical Output Engine output — identical structure for every request. */
export interface ExecutionIntent {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly goal: string;
  readonly objectives: readonly PlanObjective[];
  readonly strategy: StrategyPlan;
  readonly tasks: readonly PlanTask[];
  readonly dependencyGraph: DependencyGraph;
  readonly capabilities: CapabilityRequirements;
  readonly constraints: readonly string[];
  readonly successCriteria: readonly string[];
  readonly failureCriteria: readonly string[];
  readonly priority: IntentPriority;
  readonly traceId: string;
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    builtAt: string;
    transitionReady: boolean;
    executionReady: boolean;
    capabilityCount: number;
    taskCount: number;
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
}
