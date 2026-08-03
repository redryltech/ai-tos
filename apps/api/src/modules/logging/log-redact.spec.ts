import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { REDACTED, redactForLogging } from './log-redact';

describe('log-redact', () => {
  it('redacts sensitive object keys', () => {
    const out = redactForLogging({
      userId: 'u1',
      password: 'hunter2',
      apiKey: 'sk-live-abc',
      nested: { refreshToken: 'tok', email: 'a@b.c' },
    }) as Record<string, unknown>;

    assert.equal(out.userId, 'u1');
    assert.equal(out.password, REDACTED);
    assert.equal(out.apiKey, REDACTED);
    const nested = out.nested as Record<string, unknown>;
    assert.equal(nested.refreshToken, REDACTED);
    assert.equal(nested.email, 'a@b.c');
  });

  it('redacts bearer tokens in strings', () => {
    const out = redactForLogging('Authorization Bearer abcdefghijklmnop');
    assert.match(String(out), /REDACTED/);
    assert.doesNotMatch(String(out), /abcdefghijklmnop/);
  });
});
