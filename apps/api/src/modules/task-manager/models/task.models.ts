/** Task Manager domain models (Layer 5.2). Lifecycle only — immutable. */

export type TaskLifecycleState =
  | 'CREATED'
  | 'WAITING'
  | 'READY'
  | 'RUNNING'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskDraft {
  readonly id: string;
  readonly workflowId: string;
  readonly nodeId: string;
  readonly title: string;
  readonly kind: string;
  readonly order: number;
  readonly dependencyIds: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
  readonly createdAt: string;
}

export interface TaskDependencyGraph {
  readonly drafts: readonly TaskDraft[];
  readonly taskIds: readonly string[];
  readonly edges: Readonly<Record<string, readonly string[]>>;
  readonly reverseEdges: Readonly<Record<string, readonly string[]>>;
  readonly roots: readonly string[];
  readonly topologicalOrder: readonly string[];
}

export interface LifecycleTask {
  readonly draft: TaskDraft;
  readonly state: TaskLifecycleState;
}

export interface ExecutableTask {
  readonly id: string;
  readonly workflowId: string;
  readonly dependencyIds: readonly string[];
  readonly state: TaskLifecycleState;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
  readonly createdAt: string;
}

export interface ExecutableTaskCollection {
  readonly workflowId: string;
  readonly tasks: readonly ExecutableTask[];
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    taskCount: number;
    readyCount: number;
    waitingCount: number;
    readyTaskIds: readonly string[];
    dispatchPrepared: boolean;
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
  readonly createdAt: string;
}

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}
