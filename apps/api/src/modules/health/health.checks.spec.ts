import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateStatus } from './health.checks';

describe('health.checks aggregateStatus', () => {
  it('returns ok when all active components are ok', () => {
    assert.equal(
      aggregateStatus([
        { status: 'ok' },
        { status: 'ok' },
        { status: 'skipped' },
      ]),
      'ok',
    );
  });

  it('returns degraded when some components error', () => {
    assert.equal(
      aggregateStatus([{ status: 'ok' }, { status: 'error' }, { status: 'skipped' }]),
      'degraded',
    );
  });

  it('returns error when every active component errors', () => {
    assert.equal(aggregateStatus([{ status: 'error' }, { status: 'skipped' }]), 'error');
  });
});
