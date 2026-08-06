/** Planning Engine event topic constants (Layer 3.4). */

export const PLANNING_EVENTS = {
  started: 'planning.started',
  completed: 'planning.completed',
  failed: 'planning.failed',
} as const;

export type PlanningEventTopic =
  (typeof PLANNING_EVENTS)[keyof typeof PLANNING_EVENTS];

export interface PlanningStartedPayload {
  requestId: string;
  goal: string;
}

export interface PlanningCompletedPayload {
  requestId: string;
  strategyId: string;
  taskCount: number;
  edgeCount: number;
  durationMs: number;
}

export interface PlanningFailedPayload {
  requestId?: string;
  error: string;
  durationMs: number;
}
