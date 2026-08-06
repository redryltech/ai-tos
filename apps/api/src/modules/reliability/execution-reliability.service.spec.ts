import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionProgress } from '../parallel-executor/models/execution.models';
import { RELIABILITY_EVENTS } from './events/reliability.events';
import type { ExecutionRecoveryState } from './models/reliability.models';
import { ExecutionReliabilityService } from './execution-reliability.service';
import { CancellationManager } from './processors/cancellation.manager';
import { CheckpointManager } from './processors/checkpoint.manager';
import { CircuitBreaker } from './processors/circuit.breaker';
import { FailureClassifier } from './processors/failure.classifier';
import { RecoveryCoordinator } from './processors/recovery.coordinator';
import { RecoveryStateBuilder } from './processors/recovery.state.builder';
import { ReliabilityController } from './processors/reliability.controller';
import { RetryCoordinator } from './processors/retry.coordinator';
import { TimeoutManager } from './processors/timeout.manager';

function progress(
  overrides: Partial<ExecutionProgress> & {
    extras?: Record<string, string | number | boolean | null>;
  } = {},
): ExecutionProgress {
  const { extras, ...rest } = overrides;
  return {
    workflowId: 'wf-api-rel',
    completedTasks: rest.completedTasks ?? 0,
    runningTasks: rest.runningTasks ?? 0,
    pendingTasks: rest.pendingTasks ?? 0,
    failedTasks: rest.failedTasks ?? 1,
    progressPercentage: rest.progressPercentage ?? 0,
    metadata: {
      schemaVersion: '1.0.0',
      totalTasks: rest.metadata?.totalTasks ?? 2,
      cancelledTasks: rest.metadata?.cancelledTasks ?? 0,
      dispatchWaves: 1,
      concurrencyLimit: 8,
      workerProvider: 'local',
      completedTaskIds: Object.freeze(
        rest.metadata?.completedTaskIds ?? ([] as string[]),
      ),
      failedTaskIds: Object.freeze(
        rest.metadata?.failedTaskIds ?? (['t1'] as string[]),
      ),
      extras: Object.freeze({
        failureClass: 'TRANSIENT',
        retryCount: 0,
        ...(extras ?? {}),
      }),
    },
    traceId: 'trace-api-rel',
    timestamp: new Date().toISOString(),
  };
}

function assertState(state: ExecutionRecoveryState): void {
  assert.ok(state.workflowId);
  assert.ok(state.recoveryStatus);
  assert.ok(typeof state.retryCount === 'number');
  assert.ok('checkpointId' in state);
  assert.ok(state.circuitState);
  assert.ok(state.metadata);
  assert.ok(state.traceId);
  assert.ok(state.timestamp);
}

function createService(): {
  service: ExecutionReliabilityService;
  events: string[];
} {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('reliability.#', (e) => {
    events.push(e.topic);
  });

  const controller = new ReliabilityController(
    new FailureClassifier(),
    new RetryCoordinator(config),
    new RecoveryCoordinator(),
    new CheckpointManager(),
    new TimeoutManager(config),
    new CancellationManager(),
    new CircuitBreaker(config),
    new RecoveryStateBuilder(),
  );

  const service = new ExecutionReliabilityService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('ExecutionReliabilityService public API', () => {
  let service: ExecutionReliabilityService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('handle returns recovery state and emits started/completed', async () => {
    const result = await service.handle(
      progress({
        completedTasks: 1,
        failedTasks: 1,
        progressPercentage: 50,
        metadata: {
          schemaVersion: '1.0.0',
          totalTasks: 2,
          cancelledTasks: 0,
          dispatchWaves: 1,
          concurrencyLimit: 8,
          workerProvider: 'local',
          completedTaskIds: Object.freeze(['a']),
          failedTaskIds: Object.freeze(['b']),
          extras: Object.freeze({ failureClass: 'TRANSIENT', retryCount: 0 }),
        },
      }),
    );
    assertState(result);
    assert.equal(result.metadata.retryEligible, true);
    assert.ok(result.checkpointId);
    assert.ok(events.includes(RELIABILITY_EVENTS.started));
    assert.ok(events.includes(RELIABILITY_EVENTS.completed));
  });

  it('marks healthy when no failures', async () => {
    const result = await service.handle(
      progress({
        completedTasks: 2,
        failedTasks: 0,
        pendingTasks: 0,
        progressPercentage: 100,
        extras: {},
        metadata: {
          schemaVersion: '1.0.0',
          totalTasks: 2,
          cancelledTasks: 0,
          dispatchWaves: 1,
          concurrencyLimit: 8,
          workerProvider: 'local',
          completedTaskIds: Object.freeze(['a', 'b']),
          failedTaskIds: Object.freeze([]),
          extras: Object.freeze({}),
        },
      }),
    );
    assertState(result);
    assert.equal(result.recoveryStatus, 'healthy');
  });
});

describe('Reliability contract', () => {
  it('keeps identical top-level ExecutionRecoveryState keys', async () => {
    const { service } = createService();
    const a = await service.handle(progress());
    const b = await service.handle(
      progress({
        extras: { failureClass: 'PERMANENT' },
        workflowId: 'wf-api-rel-2',
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
