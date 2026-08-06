/** Perception Engine event topic constants (Layer 3.1). */

export const PERCEPTION_EVENTS = {
  started: 'perception.started',
  completed: 'perception.completed',
  failed: 'perception.failed',
} as const;

export type PerceptionEventTopic =
  (typeof PERCEPTION_EVENTS)[keyof typeof PERCEPTION_EVENTS];

export interface PerceptionStartedPayload {
  requestId: string;
  inputType: string;
}

export interface PerceptionCompletedPayload {
  requestId: string;
  inputType: string;
  confidence: number;
  durationMs: number;
}

export interface PerceptionFailedPayload {
  requestId?: string;
  error: string;
  durationMs: number;
}
