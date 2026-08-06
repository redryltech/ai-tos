/** AI Kernel execution state model (Phase 2.2.3). */

export type ExecutionState =
  | 'pending'
  | 'scheduled'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled';

export const EXECUTION_STATES: readonly ExecutionState[] = [
  'pending',
  'scheduled',
  'running',
  'waiting',
  'completed',
  'failed',
  'cancelled',
] as const;

export const TERMINAL_EXECUTION_STATES: ReadonlySet<ExecutionState> = new Set([
  'completed',
  'failed',
  'cancelled',
]);

/** Allowed transitions for the kernel state machine. */
export const EXECUTION_TRANSITIONS: Readonly<Record<ExecutionState, readonly ExecutionState[]>> = {
  pending: ['scheduled', 'running', 'cancelled'],
  scheduled: ['pending', 'running', 'cancelled'],
  running: ['waiting', 'completed', 'failed', 'cancelled'],
  waiting: ['running', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
};

export interface CreateExecutionInput {
  type: string;
  /** Optional external correlation (task id, pipeline id, etc.). */
  refId?: string;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  metadata?: Record<string, string | number | boolean>;
  /** Initial state; defaults to pending. */
  initialState?: Extract<ExecutionState, 'pending' | 'scheduled'>;
}

export interface ExecutionRecord {
  id: string;
  type: string;
  state: ExecutionState;
  refId?: string;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  metadata: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
  scheduledAt: string | null;
  startedAt: string | null;
  waitingAt: string | null;
  completedAt: string | null;
  error?: string;
  result?: unknown;
  history: ExecutionTransition[];
}

export interface ExecutionTransition {
  from: ExecutionState;
  to: ExecutionState;
  at: string;
  reason?: string;
}

export interface TransitionOptions {
  reason?: string;
  error?: string;
  result?: unknown;
  metadata?: Record<string, string | number | boolean>;
}

export interface StateManagerStats {
  total: number;
  pending: number;
  scheduled: number;
  running: number;
  waiting: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export function canTransition(from: ExecutionState, to: ExecutionState): boolean {
  return EXECUTION_TRANSITIONS[from].includes(to);
}
