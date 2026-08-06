/** AI Kernel lifecycle contracts (Phase 2.2.5). */

export type LifecyclePhase =
  | 'created'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'cancelled'
  | 'completed';

export type LifecycleKind = 'task' | 'execution';

export const TERMINAL_LIFECYCLE_PHASES: ReadonlySet<LifecyclePhase> = new Set([
  'stopped',
  'cancelled',
  'completed',
]);

/** Allowed lifecycle transitions. */
export const LIFECYCLE_TRANSITIONS: Readonly<Record<LifecyclePhase, readonly LifecyclePhase[]>> = {
  created: ['running', 'cancelled'],
  running: ['paused', 'stopped', 'cancelled', 'completed'],
  paused: ['running', 'stopped', 'cancelled', 'completed'],
  stopped: [],
  cancelled: [],
  completed: [],
};

export type LifecycleAction = 'start' | 'pause' | 'resume' | 'stop' | 'cancel' | 'complete';

export const LIFECYCLE_ACTION_TARGET: Readonly<Record<LifecycleAction, LifecyclePhase>> = {
  start: 'running',
  pause: 'paused',
  resume: 'running',
  stop: 'stopped',
  cancel: 'cancelled',
  complete: 'completed',
};

export interface CreateLifecycleInput {
  kind: LifecycleKind;
  type: string;
  refId?: string;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface LifecycleRecord {
  id: string;
  kind: LifecycleKind;
  type: string;
  phase: LifecyclePhase;
  refId?: string;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  metadata: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  pausedAt: string | null;
  endedAt: string | null;
  history: LifecycleEventEntry[];
  result?: unknown;
  error?: string;
}

export interface LifecycleEventEntry {
  action: LifecycleAction | 'register';
  from: LifecyclePhase | null;
  to: LifecyclePhase;
  at: string;
  reason?: string;
}

export interface LifecycleActionOptions {
  reason?: string;
  error?: string;
  result?: unknown;
  metadata?: Record<string, string | number | boolean>;
}

export interface LifecycleManagerStats {
  total: number;
  created: number;
  running: number;
  paused: number;
  stopped: number;
  cancelled: number;
  completed: number;
}

export function canLifecycleTransition(from: LifecyclePhase, to: LifecyclePhase): boolean {
  return LIFECYCLE_TRANSITIONS[from].includes(to);
}
