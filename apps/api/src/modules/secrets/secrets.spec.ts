import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { redactForLogs, SecretValue, secretKey } from './secret.types';
import { MemorySecretProvider } from './memory-secret.provider';

describe('secret.types', () => {
  it('builds stable secret keys', () => {
    assert.equal(secretKey({ kind: 'jwt_secret', name: 'access' }), 'jwt_secret:access');
  });

  it('redacts secrets for logs', () => {
    assert.equal(redactForLogs('sk-abcdef'), '****cdef');
    assert.equal(redactForLogs('ab'), '****');
    assert.equal(redactForLogs(''), '[empty]');
  });

  it('SecretValue never exposes plaintext via toString/JSON/inspect', () => {
    const secret = new SecretValue('super-secret-value-xyz', 1, 'jwt_secret', 'access');
    assert.equal(secret.reveal(), 'super-secret-value-xyz');
    assert.equal(secret.last4, '-xyz');
    assert.match(secret.toString(), /REDACTED/);
    assert.equal(JSON.stringify({ s: secret }), '{"s":"[REDACTED:jwt_secret:access:v1:**-xyz]"}');
    assert.doesNotMatch(secret.toString(), /super-secret/);
  });
});

describe('MemorySecretProvider', () => {
  let memory: MemorySecretProvider;

  beforeEach(() => {
    memory = new MemorySecretProvider();
  });

  it('stores and rotates versions', async () => {
    const ref = { kind: 'encryption_key' as const, name: 'api_keys' };
    assert.equal(await memory.get(ref), null);
    await memory.put(ref, 'first-secret-value');
    assert.equal(await memory.get(ref), 'first-secret-value');
    assert.equal(memory.getVersion(ref), 1);
    await memory.put(ref, 'second-secret-value');
    assert.equal(memory.getVersion(ref), 2);
    assert.ok(memory.getRotatedAt(ref));
  });
});
