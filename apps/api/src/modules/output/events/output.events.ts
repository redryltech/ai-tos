/** Output Engine event topic constants (Layer 3.5). */

export const OUTPUT_EVENTS = {
  started: 'output.started',
  completed: 'output.completed',
  failed: 'output.failed',
} as const;

export type OutputEventTopic = (typeof OUTPUT_EVENTS)[keyof typeof OUTPUT_EVENTS];

export interface OutputStartedPayload {
  requestId: string;
  goal: string;
}

export interface OutputCompletedPayload {
  requestId: string;
  traceId: string;
  capabilityCount: number;
  taskCount: number;
  durationMs: number;
}

export interface OutputFailedPayload {
  requestId?: string;
  error: string;
  durationMs: number;
}
