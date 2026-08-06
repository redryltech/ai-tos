/** Execution Finalizer domain models (Layer 5.6). Immutable. */

export type ExecutionFinalStatus =
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMED_OUT'
  | 'ROLLED_BACK';

export interface CompletedExecutionOutput {
  readonly id: string;
  readonly key: string;
  readonly value: string | number | boolean | null;
  readonly taskId?: string;
  readonly mimeType?: string;
}

export interface CompletedExecution {
  readonly workflowId: string;
  readonly traceId: string;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly outputs: readonly CompletedExecutionOutput[];
  readonly completedTaskIds: readonly string[];
  readonly failedTaskIds: readonly string[];
  readonly cancelledTaskIds: readonly string[];
  readonly retryCount: number;
  readonly timedOut?: boolean;
  readonly rolledBack?: boolean;
  readonly cancelled?: boolean;
  readonly version?: string;
  readonly extras?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface CollectedResult {
  readonly outputs: readonly CompletedExecutionOutput[];
  readonly completedTaskIds: readonly string[];
  readonly failedTaskIds: readonly string[];
  readonly cancelledTaskIds: readonly string[];
  readonly retryCount: number;
  readonly durationMs: number;
}

export interface ValidatedResult {
  readonly outputs: readonly CompletedExecutionOutput[];
  readonly issues: readonly string[];
  readonly hasPartialFailures: boolean;
  readonly valid: boolean;
}

export interface ComposedResult {
  readonly outputs: Readonly<Record<string, string | number | boolean | null>>;
  readonly outputCount: number;
}

export interface ExecutionSummary {
  readonly durationMs: number;
  readonly completedTasks: number;
  readonly failedTasks: number;
  readonly cancelledTasks: number;
  readonly retryCount: number;
  readonly totalTasks: number;
  readonly successRate: number;
  readonly statistics: Readonly<{
    outputCount: number;
    issueCount: number;
    hasPartialFailures: boolean;
  }>;
}

export interface ExecutionResultMetadata {
  readonly workflowId: string;
  readonly traceId: string;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly version: string;
  readonly schemaVersion: string;
  readonly extras: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ExecutionResult {
  readonly workflowId: string;
  readonly status: ExecutionFinalStatus;
  readonly outputs: Readonly<Record<string, string | number | boolean | null>>;
  readonly summary: ExecutionSummary;
  readonly metadata: ExecutionResultMetadata;
  readonly traceId: string;
  readonly completedAt: string;
}

export class FinalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinalizationError';
  }
}
