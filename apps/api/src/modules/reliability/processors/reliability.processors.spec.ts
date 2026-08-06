import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import { CancellationManager } from './cancellation.manager';
import { CheckpointManager } from './checkpoint.manager';
import { CircuitBreaker } from './circuit.breaker';
import { FailureClassifier } from './failure.classifier';
import { RecoveryCoordinator } from './recovery.coordinator';
import { RecoveryStateBuilder } from './recovery.state.builder';
import { RetryCoordinator } from './retry.coordinator';
import { TimeoutManager } from './timeout.manager';

function progress(
  overrides: Partial<ExecutionProgress> & {
    extras?: Record<string, string | number | boolean | null>;
  } = {},
): ExecutionProgress {
  const { extras, metadata, ...rest } = overrides;
  return {
    workflowId: 'wf-rel-1',
    completedTasks: 1,
    runningTasks: 0,
    pendingTasks: 0,
    failedTasks: 1,
    progressPercentage: 50,
    traceId: 'trace-rel-1',
    timestamp: new Date().toISOString(),
    ...rest,
    metadata: {
      schemaVersion: '1.0.0',
      totalTasks: metadata?.totalTasks ?? 2,
      cancelledTasks: metadata?.cancelledTasks ?? 0,
      dispatchWaves: metadata?.dispatchWaves ?? 1,
      concurrencyLimit: metadata?.concurrencyLimit ?? 8,
      workerProvider: metadata?.workerProvider ?? 'local',
      completedTaskIds: Object.freeze(
        metadata?.completedTaskIds ?? (['a'] as string[]),
      ),
      failedTaskIds: Object.freeze(
        metadata?.failedTaskIds ?? (['b'] as string[]),
      ),
      extras: Object.freeze({
        failureClass: 'TRANSIENT',
        retryCount: 0,
        ...(extras ?? {}),
        ...(metadata?.extras ?? {}),
      }),
    },
  };
}

describe('FailureClassifier', () => {
  it('classifies explicit transient failures as retryable', () => {
    const result = new FailureClassifier().classify(progress());
    assert.equal(result.failureClass, 'TRANSIENT');
    assert.equal(result.retryable, true);
  });

  it('classifies permanent failures as non-retryable', () => {
    const result = new FailureClassifier().classify(
      progress({ extras: { failureClass: 'PERMANENT' } }),
    );
    assert.equal(result.failureClass, 'PERMANENT');
    assert.equal(result.retryable, false);
  });
});

describe('RetryCoordinator + RecoveryCoordinator', () => {
  it('schedules retry for transient failures', () => {
    const config = new ConfigService();
    const classification = new FailureClassifier().classify(progress());
    const retry = new RetryCoordinator(config).decide(
      progress(),
      classification,
    );
    assert.equal(retry.eligible, true);
    assert.equal(retry.retryCount, 1);
    const plan = new RecoveryCoordinator().plan(
      progress(),
      classification,
      retry,
    );
    assert.equal(plan.action, 'resume');
  });

  it('rejects retry when max retries exhausted', () => {
    const config = new ConfigService();
    const p = progress({
      extras: {
        failureClass: 'TRANSIENT',
        retryCount: config.reliability.maxRetries,
      },
    });
    const classification = new FailureClassifier().classify(p);
    const retry = new RetryCoordinator(config).decide(p, classification);
    assert.equal(retry.eligible, false);
  });
});

describe('Checkpoint / Timeout / Cancellation / Circuit / Builder', () => {
  it('builds immutable recovery state with checkpoint', () => {
    const config = new ConfigService();
    const p = progress();
    const classification = new FailureClassifier().classify(p);
    const retry = new RetryCoordinator(config).decide(p, classification);
    const recovery = new RecoveryCoordinator().plan(p, classification, retry);
    const checkpoint = new CheckpointManager().create(p);
    assert.ok(checkpoint.id);
    const timeout = new TimeoutManager(config).assess(p);
    const cancellation = new CancellationManager().decide(p);
    const circuit = new CircuitBreaker(config).assess(p, classification);
    const state = new RecoveryStateBuilder().build({
      progress: p,
      classification,
      retry,
      recovery,
      checkpoint,
      timeout,
      cancellation,
      circuit,
    });
    assert.equal(state.workflowId, 'wf-rel-1');
    assert.equal(state.checkpointId, checkpoint.id);
    assert.equal(state.retryCount, 1);
    assert.ok(state.recoveryStatus);
    assert.ok(state.timestamp);
  });

  it('marks user cancellation', () => {
    const decision = new CancellationManager().decide(
      progress({ extras: { userCancelled: true } }),
    );
    assert.equal(decision.cancelled, true);
    assert.equal(decision.mode, 'user');
  });
});
