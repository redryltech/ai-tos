/** Decision Engine event topic constants (Layer 3.3). */

export const DECISION_EVENTS = {
  started: 'decision.started',
  completed: 'decision.completed',
  failed: 'decision.failed',
} as const;

export type DecisionEventTopic =
  (typeof DECISION_EVENTS)[keyof typeof DECISION_EVENTS];

export interface DecisionStartedPayload {
  requestId: string;
  goal: string;
}

export interface DecisionCompletedPayload {
  requestId: string;
  selectedActionId: string;
  confidence: number;
  commitmentLevel: string;
  approvalRequired: boolean;
  durationMs: number;
}

export interface DecisionFailedPayload {
  requestId?: string;
  error: string;
  durationMs: number;
}
