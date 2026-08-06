/** Execution Reliability Engine domain models (Layer 5.4). Immutable. */

export type FailureClass =
  | 'TRANSIENT'
  | 'PERMANENT'
  | 'TIMEOUT'
  | 'DEPENDENCY'
  | 'RESOURCE'
  | 'USER'
  | 'UNKNOWN';

export type RecoveryAction = 'none' | 'resume' | 'restart' | 'rollback' | 'cancel';

export type RecoveryStatus =
  | 'healthy'
  | 'retry_scheduled'
  | 'recovering'
  | 'checkpointed'
  | 'timed_out'
  | 'cancelled'
  | 'circuit_open'
  | 'exhausted'
  | 'failed';

export type CircuitBreakerState = 'closed' | 'open' | 'half_open';

export interface FailureClassification {
  readonly failureClass: FailureClass;
  readonly reason: string;
  readonly failedTaskIds: readonly string[];
  readonly retryable: boolean;
}

export interface RetryDecision {
  readonly eligible: boolean;
  readonly retryCount: number;
  readonly maxRetries: number;
  readonly backoffMs: number;
  readonly reason: string;
}

export interface RecoveryPlan {
  readonly action: RecoveryAction;
  readonly reason: string;
  readonly resumeFromCheckpoint: boolean;
}

export interface CheckpointRecord {
  readonly id: string;
  readonly workflowId: string;
  readonly progressPercentage: number;
  readonly completedTaskIds: readonly string[];
  readonly failedTaskIds: readonly string[];
  readonly createdAt: string;
}

export interface TimeoutAssessment {
  readonly executionTimedOut: boolean;
  readonly heartbeatTimedOut: boolean;
  readonly idleTimedOut: boolean;
  readonly reason?: string;
}

export interface CancellationDecision {
  readonly cancelled: boolean;
  readonly mode: 'none' | 'graceful' | 'user' | 'system';
  readonly reason?: string;
}

export interface CircuitAssessment {
  readonly state: CircuitBreakerState;
  readonly failureCount: number;
  readonly opened: boolean;
}

export interface ExecutionRecoveryState {
  readonly workflowId: string;
  readonly recoveryStatus: RecoveryStatus;
  readonly retryCount: number;
  readonly checkpointId: string | null;
  readonly circuitState: CircuitBreakerState;
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    failureClass: FailureClass;
    recoveryAction: RecoveryAction;
    retryEligible: boolean;
    maxRetries: number;
    backoffMs: number;
    cancelled: boolean;
    cancellationMode: CancellationDecision['mode'];
    executionTimedOut: boolean;
    heartbeatTimedOut: boolean;
    idleTimedOut: boolean;
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
  readonly traceId: string;
  readonly timestamp: string;
}

export class ReliabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReliabilityError';
  }
}
