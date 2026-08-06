/** AI Kernel task model (Phase 2.2.1). */

export type TaskState =
  | 'pending'
  | 'scheduled'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface CreateTaskInput<TPayload = unknown> {
  type: string;
  payload?: TPayload;
  /** Higher runs first. Equal priority preserves FIFO. */
  priority?: number;
  /** Delay before eligible (ms). */
  delayMs?: number;
  /** Absolute schedule time; overrides delayMs when set. */
  runAt?: Date | string;
  maxRetries?: number;
  timeoutMs?: number;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
}

export interface KernelTask<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  priority: number;
  state: TaskState;
  createdAt: string;
  scheduledFor: string | null;
  startedAt: string | null;
  completedAt: string | null;
  attempts: number;
  maxRetries: number;
  timeoutMs: number;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  error?: string;
  result?: unknown;
  sequence: number;
}

export interface TaskHandlerContext {
  task: KernelTask;
  signal: AbortSignal;
}

export type TaskHandler = (ctx: TaskHandlerContext) => Promise<unknown> | unknown;

export interface TaskSchedulerStats {
  total: number;
  pending: number;
  scheduled: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  enabled: boolean;
}
