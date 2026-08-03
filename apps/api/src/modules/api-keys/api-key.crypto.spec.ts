import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decryptSecret, encryptSecret, keyLast4 } from './api-key.crypto';
import { toPublicApiKey } from './api-key.mapper';

describe('api-key.crypto', () => {
  const secret = 'unit-test-encryption-secret-32chars!!';

  it('encrypts and decrypts round-trip', () => {
    const plaintext = 'sk-test-openai-secret-value';
    const enc = encryptSecret(plaintext, secret);
    assert.notEqual(enc.ciphertext, plaintext);
    assert.equal(decryptSecret(enc, secret), plaintext);
  });

  it('produces distinct ciphertext for same plaintext', () => {
    const a = encryptSecret('same-key', secret);
    const b = encryptSecret('same-key', secret);
    assert.notEqual(a.nonce, b.nonce);
    assert.notEqual(a.ciphertext, b.ciphertext);
  });

  it('derives last4 safely', () => {
    assert.equal(keyLast4('sk-abcdef'), 'cdef');
    assert.equal(keyLast4('ab'), '**ab');
  });
});

describe('api-key.mapper', () => {
  it('never includes ciphertext fields in public view', () => {
    const pub = toPublicApiKey({
      id: '11111111-1111-1111-1111-111111111111',
      organization_id: '22222222-2222-2222-2222-222222222222',
      provider: 'openai',
      name: 'Prod',
      key_ciphertext: 'CIPHER',
      key_nonce: 'NONCE',
      key_auth_tag: 'TAG',
      key_last4: 'cdef',
      status: 'active',
      created_by: '33333333-3333-3333-3333-333333333333',
      revoked_at: null,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    });
    assert.equal(pub.keyLast4, 'cdef');
    assert.equal('key_ciphertext' in pub, false);
    assert.equal('secret' in pub, false);
    assert.deepEqual(Object.keys(pub).sort(), [
      'createdAt',
      'createdBy',
      'id',
      'keyLast4',
      'name',
      'organizationId',
      'provider',
      'revokedAt',
      'status',
      'updatedAt',
    ]);
  });
});
