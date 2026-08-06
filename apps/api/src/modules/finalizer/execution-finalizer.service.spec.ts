import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { FINALIZATION_EVENTS } from './events/finalizer.events';
import type {
  CompletedExecution,
  ExecutionResult,
} from './models/finalizer.models';
import { ExecutionFinalizerService } from './execution-finalizer.service';
import { ExecutionResultBuilder } from './processors/execution.result.builder';
import { ExecutionStatusResolver } from './processors/execution.status.resolver';
import { ExecutionSummaryBuilder } from './processors/execution.summary.builder';
import { FinalizationController } from './processors/finalization.controller';
import { MetadataBuilder } from './processors/metadata.builder';
import { ResultCollector } from './processors/result.collector';
import { ResultComposer } from './processors/result.composer';
import { ResultValidator } from './processors/result.validator';

function completed(
  overrides: Partial<CompletedExecution> = {},
): CompletedExecution {
  return {
    workflowId: 'wf-api-fin',
    traceId: 'trace-api-fin',
    startedAt: new Date(Date.now() - 2000).toISOString(),
    endedAt: new Date().toISOString(),
    outputs: Object.freeze([
      Object.freeze({ id: 'o1', key: 'result', value: 42 }),
    ]),
    completedTaskIds: Object.freeze(['t1']),
    failedTaskIds: Object.freeze([]),
    cancelledTaskIds: Object.freeze([]),
    retryCount: 1,
    version: '1.0.0',
    extras: Object.freeze({}),
    ...overrides,
  };
}

function assertResult(r: ExecutionResult): void {
  assert.ok(r.workflowId);
  assert.ok(r.status);
  assert.ok(r.outputs);
  assert.ok(r.summary);
  assert.ok(r.metadata);
  assert.ok(r.traceId);
  assert.ok(r.completedAt);
}

function createService(): {
  service: ExecutionFinalizerService;
  events: string[];
} {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('finalization.#', (e) => {
    events.push(e.topic);
  });

  const controller = new FinalizationController(
    new ResultCollector(),
    new ResultValidator(config),
    new ResultComposer(),
    new ExecutionSummaryBuilder(),
    new MetadataBuilder(config),
    new ExecutionStatusResolver(),
    new ExecutionResultBuilder(),
  );

  const service = new ExecutionFinalizerService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('ExecutionFinalizerService public API', () => {
  let service: ExecutionFinalizerService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('finalize returns ExecutionResult and emits started/completed', async () => {
    const result = await service.finalize(completed());
    assertResult(result);
    assert.equal(result.status, 'SUCCESS');
    assert.equal(result.outputs.result, 42);
    assert.equal(result.summary.retryCount, 1);
    assert.ok(events.includes(FINALIZATION_EVENTS.started));
    assert.ok(events.includes(FINALIZATION_EVENTS.completed));
  });

  it('emits failed for invalid input', async () => {
    await assert.rejects(
      () => service.finalize(null as unknown as CompletedExecution),
      /CompletedExecution is required/,
    );
    assert.ok(events.includes(FINALIZATION_EVENTS.failed));
  });
});

describe('Finalizer contract', () => {
  it('keeps identical top-level ExecutionResult keys', async () => {
    const { service } = createService();
    const a = await service.finalize(completed());
    const b = await service.finalize(
      completed({
        workflowId: 'wf-api-fin-2',
        failedTaskIds: Object.freeze(['t2']),
        completedTaskIds: Object.freeze(['t1']),
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    assert.equal(b.status, 'PARTIAL_SUCCESS');
  });
});
