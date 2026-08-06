/** Streaming Engine domain models (Layer 5.5). Immutable stream snapshots. */

export type StreamEventKind =
  | 'workflow'
  | 'task'
  | 'lifecycle'
  | 'progress'
  | 'output'
  | 'system';

export interface StreamEvent {
  readonly id: string;
  readonly kind: StreamEventKind;
  readonly topic: string;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly timestamp: string;
}

export interface StreamOutput {
  readonly id: string;
  readonly sequence: number;
  readonly content: string;
  readonly mimeType: string;
  readonly timestamp: string;
}

export interface StreamProgressSnapshot {
  readonly completedTasks: number;
  readonly runningTasks: number;
  readonly pendingTasks: number;
  readonly failedTasks: number;
  readonly progressPercentage: number;
}

export type BackpressureState = 'ok' | 'throttled' | 'paused';

export interface BackpressureDecision {
  readonly state: BackpressureState;
  readonly bufferSize: number;
  readonly highWatermark: number;
  readonly lowWatermark: number;
  readonly accepted: boolean;
}

export interface StreamSubscription {
  readonly id: string;
  readonly streamId: string;
  readonly workflowId: string;
  readonly createdAt: string;
}

export interface ExecutionStream {
  readonly streamId: string;
  readonly workflowId: string;
  readonly events: readonly StreamEvent[];
  readonly outputs: readonly StreamOutput[];
  readonly progress: StreamProgressSnapshot;
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    backpressureState: BackpressureState;
    subscriberCount: number;
    transportProvider: string;
    published: boolean;
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
  readonly traceId: string;
  readonly timestamp: string;
}

export class StreamingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StreamingError';
  }
}
