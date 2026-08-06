import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import { BackpressureManager } from './backpressure.manager';
import { EventStreamManager } from './event.stream.manager';
import { MemoryStreamTransport } from './memory.stream.transport';
import { OutputStreamManager } from './output.stream.manager';
import { ProgressStreamManager } from './progress.stream.manager';
import { StreamBuilder } from './stream.builder';
import { StreamPublisher } from './stream.publisher';
import { SubscriptionManager } from './subscription.manager';
import { StreamingError } from '../models/streaming.models';

function progress(
  overrides: Partial<ExecutionProgress> = {},
): ExecutionProgress {
  return {
    workflowId: 'wf-stream-1',
    completedTasks: 1,
    runningTasks: 0,
    pendingTasks: 1,
    failedTasks: 0,
    progressPercentage: 50,
    metadata: {
      schemaVersion: '1.0.0',
      totalTasks: 2,
      cancelledTasks: 0,
      dispatchWaves: 1,
      concurrencyLimit: 8,
      workerProvider: 'local',
      completedTaskIds: Object.freeze(['a']),
      failedTaskIds: Object.freeze([]),
      extras: Object.freeze({ outputChunk: 'hello' }),
    },
    traceId: 'trace-stream-1',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('Event/Output/Progress managers', () => {
  it('builds events, outputs, and progress snapshots', () => {
    const p = progress();
    const events = new EventStreamManager().build(p);
    assert.ok(events.length >= 2);
    assert.ok(events.some((e) => e.kind === 'workflow'));
    assert.ok(events.some((e) => e.kind === 'task'));

    const outputs = new OutputStreamManager().build(p);
    assert.ok(outputs.length >= 1);
    assert.ok(outputs.some((o) => o.content === 'hello'));

    const snap = new ProgressStreamManager().build(p);
    assert.equal(snap.progressPercentage, 50);
    assert.equal(snap.completedTasks, 1);
  });
});

describe('Backpressure + Subscription + Publisher', () => {
  it('evaluates backpressure and publishes via abstract transport', async () => {
    const config = new ConfigService();
    const bp = new BackpressureManager(config).evaluate(10);
    assert.equal(bp.state, 'ok');
    assert.equal(bp.accepted, true);

    const paused = new BackpressureManager(config).evaluate(
      config.streaming.maxBufferSize + 1,
    );
    assert.equal(paused.accepted, false);
    assert.equal(paused.state, 'paused');

    const subs = new SubscriptionManager(config);
    const sub = subs.register('stream-1', 'wf-stream-1');
    assert.equal(subs.count('stream-1'), 1);
    assert.equal(subs.unregister(sub.id), true);

    const p = progress();
    const events = new EventStreamManager().build(p);
    const outputs = new OutputStreamManager().build(p);
    const snap = new ProgressStreamManager().build(p);
    const stream = new StreamBuilder().build({
      progress: p,
      events,
      outputs,
      progressSnapshot: snap,
      backpressure: bp,
      subscriberCount: 1,
      published: false,
      transportProvider: 'memory',
    });
    const transport = new MemoryStreamTransport();
    const published = await new StreamPublisher(transport).publish(stream);
    assert.equal(published.metadata.published, true);
    assert.equal(transport.last()?.streamId, stream.streamId);
  });

  it('rejects missing progress', () => {
    assert.throws(
      () => new EventStreamManager().build(null as unknown as ExecutionProgress),
      StreamingError,
    );
  });
});
