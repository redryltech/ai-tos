/** Workflow Engine domain models (Layer 5.1). Compile-time only — immutable. */

import type { ExecutionIntent } from '../../output/models/execution-intent.models';

export type ExecutionStrategyKind =
  | 'sequential'
  | 'parallel'
  | 'hybrid'
  | 'conditional'
  | 'fan_out'
  | 'fan_in';

export interface WorkflowNode {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly kind: string;
  readonly order: number;
  readonly groupId?: string;
  readonly parentNodeId?: string;
  readonly capabilityHints: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface WorkflowObjective {
  readonly id: string;
  readonly description: string;
  readonly priority: string;
}

export interface WorkflowDraft {
  readonly requestId: string;
  readonly goal: string;
  readonly objectives: readonly WorkflowObjective[];
  readonly nodes: readonly WorkflowNode[];
  readonly sourceTaskIds: readonly string[];
  readonly capabilityNames: readonly string[];
  readonly constraints: readonly string[];
  readonly successCriteria: readonly string[];
  readonly failureCriteria: readonly string[];
  readonly priority: string;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface WorkflowEdge {
  readonly id: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly type: 'prerequisite' | 'sequence' | 'constraint';
}

export interface WorkflowGraph {
  readonly nodes: readonly WorkflowNode[];
  readonly edges: readonly WorkflowEdge[];
  readonly adjacency: Readonly<Record<string, readonly string[]>>;
  readonly reverseAdjacency: Readonly<Record<string, readonly string[]>>;
  readonly roots: readonly string[];
  readonly leaves: readonly string[];
  readonly topologicalOrder: readonly string[];
}

export interface ExecutionStrategy {
  readonly kind: ExecutionStrategyKind;
  readonly parallelGroups: readonly (readonly string[])[];
  readonly sequentialChains: readonly (readonly string[])[];
  readonly fanOutNodes: readonly string[];
  readonly fanInNodes: readonly string[];
  readonly conditionalGates: readonly string[];
  readonly maxConcurrency: number;
  readonly summary: string;
}

export interface WorkflowContext {
  readonly executionIntent: ExecutionIntent;
  readonly traceId: string;
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly variables: Readonly<Record<string, string | number | boolean | null>>;
  readonly policyReferences: readonly string[];
  readonly memoryReferences: readonly string[];
  readonly knowledgeReferences: readonly string[];
}

export interface WorkflowTaskSpec {
  readonly id: string;
  readonly nodeId: string;
  readonly title: string;
  readonly kind: string;
  readonly dependsOn: readonly string[];
  readonly order: number;
}

export interface ExecutableWorkflow {
  readonly id: string;
  readonly workflowGraph: WorkflowGraph;
  readonly executionStrategy: ExecutionStrategy;
  readonly tasks: readonly WorkflowTaskSpec[];
  readonly context: WorkflowContext;
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    goal: string;
    nodeCount: number;
    edgeCount: number;
    strategyKind: ExecutionStrategyKind;
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
  readonly traceId: string;
  readonly version: string;
  readonly createdAt: string;
}

export class WorkflowValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowValidationError';
  }
}
