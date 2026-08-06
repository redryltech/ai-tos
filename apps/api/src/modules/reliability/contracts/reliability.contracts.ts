import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type {
  CancellationDecision,
  CheckpointRecord,
  CircuitAssessment,
  ExecutionRecoveryState,
  FailureClassification,
  RecoveryPlan,
  RetryDecision,
  TimeoutAssessment,
} from '../models/reliability.models';

export const EXECUTION_RELIABILITY_SERVICE = Symbol(
  'EXECUTION_RELIABILITY_SERVICE',
);
export const RELIABILITY_CONTROLLER = Symbol('RELIABILITY_CONTROLLER');
export const FAILURE_CLASSIFIER = Symbol('FAILURE_CLASSIFIER');
export const RETRY_COORDINATOR = Symbol('RETRY_COORDINATOR');
export const RECOVERY_COORDINATOR = Symbol('RECOVERY_COORDINATOR');
export const CHECKPOINT_MANAGER = Symbol('CHECKPOINT_MANAGER');
export const TIMEOUT_MANAGER = Symbol('TIMEOUT_MANAGER');
export const CANCELLATION_MANAGER = Symbol('CANCELLATION_MANAGER');
export const CIRCUIT_BREAKER = Symbol('CIRCUIT_BREAKER');
export const RECOVERY_STATE_BUILDER = Symbol('RECOVERY_STATE_BUILDER');

export interface IFailureClassifier {
  classify(progress: ExecutionProgress): FailureClassification;
}

export interface IRetryCoordinator {
  decide(
    progress: ExecutionProgress,
    classification: FailureClassification,
  ): RetryDecision;
}

export interface IRecoveryCoordinator {
  plan(
    progress: ExecutionProgress,
    classification: FailureClassification,
    retry: RetryDecision,
  ): RecoveryPlan;
}

export interface ICheckpointManager {
  create(progress: ExecutionProgress): CheckpointRecord;
  restore(checkpointId: string): CheckpointRecord | null;
}

export interface ITimeoutManager {
  assess(progress: ExecutionProgress): TimeoutAssessment;
}

export interface ICancellationManager {
  decide(progress: ExecutionProgress): CancellationDecision;
}

export interface ICircuitBreaker {
  assess(progress: ExecutionProgress, classification: FailureClassification): CircuitAssessment;
  recordSuccess(workflowId: string): void;
}

export interface IRecoveryStateBuilder {
  build(input: {
    progress: ExecutionProgress;
    classification: FailureClassification;
    retry: RetryDecision;
    recovery: RecoveryPlan;
    checkpoint: CheckpointRecord | null;
    timeout: TimeoutAssessment;
    cancellation: CancellationDecision;
    circuit: CircuitAssessment;
  }): ExecutionRecoveryState;
}

export interface IReliabilityController {
  handle(progress: ExecutionProgress): Promise<ExecutionRecoveryState>;
}

/** Sole public Execution Reliability Engine contract. */
export interface IExecutionReliabilityService {
  handle(executionProgress: ExecutionProgress): Promise<ExecutionRecoveryState>;
}
