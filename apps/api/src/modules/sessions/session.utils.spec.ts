import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isSessionActive, toPublicSession } from './session.utils';

describe('session.utils', () => {
  it('treats unrevoked non-expired sessions as active', () => {
    assert.equal(
      isSessionActive({
        revoked_at: null,
        expires_at: new Date(Date.now() + 60_000),
      }),
      true,
    );
  });

  it('treats revoked or expired sessions as inactive', () => {
    assert.equal(
      isSessionActive({
        revoked_at: new Date(),
        expires_at: new Date(Date.now() + 60_000),
      }),
      false,
    );
    assert.equal(
      isSessionActive({
        revoked_at: null,
        expires_at: new Date(Date.now() - 1_000),
      }),
      false,
    );
  });

  it('maps public session without refresh material', () => {
    const pub = toPublicSession(
      {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        organization_id: null,
        refresh_token_id: '33333333-3333-3333-3333-333333333333',
        refresh_token_hash: 'abc123',
        user_agent: 'test-agent',
        ip_address: '127.0.0.1',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        last_active_at: new Date('2026-01-01T01:00:00.000Z'),
        expires_at: new Date('2026-01-08T00:00:00.000Z'),
        revoked_at: null,
      },
      { isCurrent: true },
    );
    assert.equal(pub.isCurrent, true);
    assert.equal(pub.userAgent, 'test-agent');
    assert.equal('refresh_token_hash' in pub, false);
    assert.equal('refreshTokenHash' in pub, false);
  });
});
