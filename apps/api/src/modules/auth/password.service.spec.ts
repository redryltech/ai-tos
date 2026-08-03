import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PasswordService } from './password.service';
import { durationToMs, hashToken } from './auth.cookies';

describe('PasswordService', () => {
  const passwords = new PasswordService();

  it('hashes and verifies with argon2id', async () => {
    const hash = await passwords.hash('CorrectHorseBatteryStaple1!');
    assert.ok(hash.startsWith('$argon2'));
    assert.equal(await passwords.verify(hash, 'CorrectHorseBatteryStaple1!'), true);
    assert.equal(await passwords.verify(hash, 'wrong-password'), false);
  });
});

describe('auth.cookies helpers', () => {
  it('hashes tokens deterministically', () => {
    assert.equal(hashToken('abc'), hashToken('abc'));
    assert.notEqual(hashToken('abc'), hashToken('abd'));
  });

  it('parses duration strings', () => {
    assert.equal(durationToMs('15m'), 15 * 60 * 1000);
    assert.equal(durationToMs('7d'), 7 * 24 * 60 * 60 * 1000);
    assert.equal(durationToMs('30s'), 30_000);
  });
});
