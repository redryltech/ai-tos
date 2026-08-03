import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertValidTopic, topicMatches } from './event-routing';

describe('event-routing', () => {
  it('matches exact topics', () => {
    assert.equal(topicMatches('ai.request.completed', 'ai.request.completed'), true);
    assert.equal(topicMatches('ai.request.completed', 'ai.request.failed'), false);
  });

  it('matches single-segment wildcards', () => {
    assert.equal(topicMatches('ai.*.completed', 'ai.request.completed'), true);
    assert.equal(topicMatches('ai.*.completed', 'ai.job.completed'), true);
    assert.equal(topicMatches('ai.*.completed', 'ai.request.failed'), false);
  });

  it('matches multi-segment wildcards', () => {
    assert.equal(topicMatches('kernel.#', 'kernel.job.started'), true);
    assert.equal(topicMatches('kernel.#', 'kernel.job.step.done'), true);
    assert.equal(topicMatches('kernel.#', 'ai.job.started'), false);
  });

  it('validates topic shape', () => {
    assert.doesNotThrow(() => assertValidTopic('worker.task.finished'));
    assert.throws(() => assertValidTopic('bad'), /Invalid event topic/);
  });
});
