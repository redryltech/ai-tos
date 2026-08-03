import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isManagerTeamAuditResource,
  resourceForAction,
  toPublicAuditLog,
} from './audit.utils';

describe('audit.utils', () => {
  it('maps actions to resources', () => {
    assert.equal(resourceForAction('auth.login'), 'auth');
    assert.equal(resourceForAction('organization.create'), 'organization');
    assert.equal(resourceForAction('rbac.role_assign'), 'roles');
    assert.equal(resourceForAction('api_key.revoke'), 'api_keys');
    assert.equal(resourceForAction('session.revoke'), 'session');
  });

  it('identifies manager team resources', () => {
    assert.equal(isManagerTeamAuditResource('users'), true);
    assert.equal(isManagerTeamAuditResource('api_keys'), false);
    assert.equal(isManagerTeamAuditResource('organization'), false);
  });

  it('maps public audit log', () => {
    const pub = toPublicAuditLog({
      id: '11111111-1111-1111-1111-111111111111',
      organization_id: '22222222-2222-2222-2222-222222222222',
      user_id: '33333333-3333-3333-3333-333333333333',
      action: 'auth.login',
      resource: 'auth',
      resource_id: null,
      ip_address: '127.0.0.1',
      user_agent: 'test',
      metadata: { ok: true },
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    });
    assert.equal(pub.action, 'auth.login');
    assert.equal(pub.createdAt, '2026-01-01T00:00:00.000Z');
  });
});
