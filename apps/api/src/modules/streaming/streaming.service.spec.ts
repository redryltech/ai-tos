import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionProgress } from '../parallel-executor/models/execution.models';
import { STREAMING_EVENTS } from './events/streaming.events';
import type { ExecutionStream } from './models/streaming.models';
import { BackpressureManager } from './processors/backpressure.manager';
import { EventStreamManager } from './processors/event.stream.manager';
import { MemoryStreamTransport } from './processors/memory.stream.transport';
import { OutputStreamManager } from './processors/output.stream.manager';
import { ProgressStreamManager } from './processors/progress.stream.manager';
import { StreamBuilder } from './processors/stream.builder';
import { StreamPublisher } from './processors/stream.publisher';
import { StreamingController } from './processors/streaming.controller';
import { SubscriptionManager } from './processors/subscription.manager';
import { StreamingService } from './streaming.service';

function progress(
  overrides: Partial<ExecutionProgress> = {},
): ExecutionProgress {
  return {
    workflowId: 'wf-api-stream',
    completedTasks: 2,
    runningTasks: 0,
    pendingTasks: 0,
    failedTasks: 0,
    progressPercentage: 100,
    metadata: {
      schemaVersion: '1.0.0',
      totalTasks: 2,
      cancelledTasks: 0,
      dispatchWaves: 1,
      concurrencyLimit: 8,
      workerProvider: 'local',
      completedTaskIds: Object.freeze(['a', 'b']),
      failedTaskIds: Object.freeze([]),
      extras: Object.freeze({ outputChunk: 'done' }),
    },
    traceId: 'trace-api-stream',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

function assertStream(s: ExecutionStream): void {
  assert.ok(s.streamId);
  assert.ok(s.workflowId);
  assert.ok(Array.isArray(s.events));
  assert.ok(Array.isArray(s.outputs));
  assert.ok(s.progress);
  assert.ok(s.metadata);
  assert.ok(s.traceId);
  assert.ok(s.timestamp);
}

function createService(): { service: StreamingService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('stream.#', (e) => {
    events.push(e.topic);
  });

  const transport = new MemoryStreamTransport();
  const controller = new StreamingController(
    config,
    new EventStreamManager(),
    new OutputStreamManager(),
    new ProgressStreamManager(),
    new BackpressureManager(config),
    new SubscriptionManager(config),
    new StreamBuilder(),
    new StreamPublisher(transport),
  );

  const service = new StreamingService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('StreamingService public API', () => {
  let service: StreamingService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('stream returns ExecutionStream and emits started/progress/completed', async () => {
    const result = await service.stream(progress());
    assertStream(result);
    assert.equal(result.workflowId, 'wf-api-stream');
    assert.equal(result.metadata.published, true);
    assert.ok(result.events.length >= 2);
    assert.ok(result.outputs.length >= 1);
    assert.ok(events.includes(STREAMING_EVENTS.started));
    assert.ok(events.includes(STREAMING_EVENTS.progress));
    assert.ok(events.includes(STREAMING_EVENTS.completed));
  });

  it('emits failed for missing progress', async () => {
    await assert.rejects(
      () => service.stream(null as unknown as ExecutionProgress),
      /ExecutionProgress is required/,
    );
    assert.ok(events.includes(STREAMING_EVENTS.failed));
  });
});

describe('Streaming contract', () => {
  it('keeps identical top-level ExecutionStream keys', async () => {
    const { service } = createService();
    const a = await service.stream(progress());
    const b = await service.stream(
      progress({
        workflowId: 'wf-api-stream-2',
        progressPercentage: 25,
        completedTasks: 0,
        pendingTasks: 2,
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
