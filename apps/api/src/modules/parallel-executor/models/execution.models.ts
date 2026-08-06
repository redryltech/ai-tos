/** Parallel Executor domain models (Layer 5.3). Ephemeral progress only. */

export type ExecutionTaskState =
  | 'RUNNING'
  | 'WAITING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface WorkerResult {
  readonly taskId: string;
  readonly success: boolean;
  readonly durationMs: number;
  readonly error?: string;
  readonly resourceUnits: Readonly<{
    cpu: number;
    memoryMb: number;
    gpu: number;
    tokens: number;
  }>;
}

export interface ResourceLease {
  readonly taskId: string;
  readonly cpu: number;
  readonly memoryMb: number;
  readonly gpu: number;
  readonly tokens: number;
}

export interface ResourceSnapshot {
  readonly cpuAvailable: number;
  readonly memoryMbAvailable: number;
  readonly gpuAvailable: number;
  readonly tokensAvailable: number;
  readonly activeLeases: number;
}

export interface MonitoredTask {
  readonly taskId: string;
  readonly state: ExecutionTaskState;
  readonly error?: string;
}

export interface ExecutionSnapshot {
  readonly workflowId: string;
  readonly tasks: readonly MonitoredTask[];
  readonly completedTaskIds: readonly string[];
  readonly runningTaskIds: readonly string[];
  readonly pendingTaskIds: readonly string[];
  readonly failedTaskIds: readonly string[];
  readonly cancelledTaskIds: readonly string[];
}

export interface ExecutionProgress {
  readonly workflowId: string;
  readonly completedTasks: number;
  readonly runningTasks: number;
  readonly pendingTasks: number;
  readonly failedTasks: number;
  readonly progressPercentage: number;
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    totalTasks: number;
    cancelledTasks: number;
    dispatchWaves: number;
    concurrencyLimit: number;
    workerProvider: string;
    completedTaskIds: readonly string[];
    failedTaskIds: readonly string[];
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
  readonly traceId: string;
  readonly timestamp: string;
}

export class ExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionError';
  }
}
