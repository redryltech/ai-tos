/** Thinking Engine event topic constants (Layer 3.2). */

export const THINKING_EVENTS = {
  started: 'thinking.started',
  completed: 'thinking.completed',
  failed: 'thinking.failed',
} as const;

export type ThinkingEventTopic =
  (typeof THINKING_EVENTS)[keyof typeof THINKING_EVENTS];

export interface ThinkingStartedPayload {
  requestId: string;
  goal: string;
}

export interface ThinkingCompletedPayload {
  requestId: string;
  confidence: number;
  candidateCount: number;
  durationMs: number;
}

export interface ThinkingFailedPayload {
  requestId?: string;
  error: string;
  durationMs: number;
}
