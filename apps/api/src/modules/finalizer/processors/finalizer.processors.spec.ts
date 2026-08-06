import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type { CompletedExecution } from '../models/finalizer.models';
import { FinalizationError } from '../models/finalizer.models';
import { ExecutionResultBuilder } from './execution.result.builder';
import { ExecutionStatusResolver } from './execution.status.resolver';
import { ExecutionSummaryBuilder } from './execution.summary.builder';
import { MetadataBuilder } from './metadata.builder';
import { ResultCollector } from './result.collector';
import { ResultComposer } from './result.composer';
import { ResultValidator } from './result.validator';

function completed(
  overrides: Partial<CompletedExecution> = {},
): CompletedExecution {
  const startedAt = new Date(Date.now() - 5000).toISOString();
  const endedAt = new Date().toISOString();
  return {
    workflowId: 'wf-fin-1',
    traceId: 'trace-fin-1',
    startedAt,
    endedAt,
    outputs: Object.freeze([
      Object.freeze({
        id: 'o1',
        key: 'answer',
        value: 'ok',
        taskId: 'a',
      }),
    ]),
    completedTaskIds: Object.freeze(['a', 'b']),
    failedTaskIds: Object.freeze([]),
    cancelledTaskIds: Object.freeze([]),
    retryCount: 0,
    version: '1.0.0',
    extras: Object.freeze({}),
    ...overrides,
  };
}

describe('ResultCollector + Validator + Composer', () => {
  it('collects and composes outputs', () => {
    const config = new ConfigService();
    const c = completed();
    const collected = new ResultCollector().collect(c);
    assert.ok(collected.durationMs >= 0);
    assert.equal(collected.completedTaskIds.length, 2);

    const validated = new ResultValidator(config).validate(c, collected);
    assert.equal(validated.valid, true);
    const composed = new ResultComposer().compose(validated);
    assert.equal(composed.outputs.answer, 'ok');
  });

  it('detects duplicate output keys', () => {
    const config = new ConfigService();
    const c = completed({
      outputs: Object.freeze([
        Object.freeze({ id: 'o1', key: 'answer', value: 'a' }),
        Object.freeze({ id: 'o2', key: 'answer', value: 'b' }),
      ]),
    });
    const collected = new ResultCollector().collect(c);
    const validated = new ResultValidator(config).validate(c, collected);
    assert.ok(validated.issues.some((i) => i.includes('Duplicate output key')));
  });

  it('rejects invalid timestamps', () => {
    assert.throws(
      () =>
        new ResultCollector().collect(
          completed({
            startedAt: 'bad',
            endedAt: 'also-bad',
          }),
        ),
      FinalizationError,
    );
  });
});

describe('Status + Summary + Result Builder', () => {
  it('resolves SUCCESS and builds ExecutionResult', () => {
    const config = new ConfigService();
    const c = completed();
    const collected = new ResultCollector().collect(c);
    const validated = new ResultValidator(config).validate(c, collected);
    const composed = new ResultComposer().compose(validated);
    const summary = new ExecutionSummaryBuilder().build(
      collected,
      validated,
      composed,
    );
    const metadata = new MetadataBuilder(config).build(c);
    const status = new ExecutionStatusResolver().resolve(
      c,
      collected,
      validated,
    );
    assert.equal(status, 'SUCCESS');
    const result = new ExecutionResultBuilder().build({
      completed: c,
      status,
      composed,
      summary,
      metadata,
    });
    assert.equal(result.workflowId, 'wf-fin-1');
    assert.equal(result.status, 'SUCCESS');
    assert.equal(result.summary.completedTasks, 2);
    assert.ok(result.completedAt);
  });

  it('resolves PARTIAL_SUCCESS and CANCELLED', () => {
    const config = new ConfigService();
    const partial = completed({
      completedTaskIds: Object.freeze(['a']),
      failedTaskIds: Object.freeze(['b']),
    });
    const collected = new ResultCollector().collect(partial);
    const validated = new ResultValidator(config).validate(partial, collected);
    assert.equal(
      new ExecutionStatusResolver().resolve(partial, collected, validated),
      'PARTIAL_SUCCESS',
    );

    const cancelled = completed({ cancelled: true, cancelledTaskIds: Object.freeze(['a']) });
    const cCollected = new ResultCollector().collect(cancelled);
    const cValidated = new ResultValidator(config).validate(
      cancelled,
      cCollected,
    );
    assert.equal(
      new ExecutionStatusResolver().resolve(cancelled, cCollected, cValidated),
      'CANCELLED',
    );
  });
});
