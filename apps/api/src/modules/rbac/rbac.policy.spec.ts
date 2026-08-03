import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canAssignRole,
  permissionSatisfied,
  anyPermissionSatisfied,
  RBAC_ROLE_RANK,
} from './rbac.policy';

describe('rbac.policy', () => {
  it('treats manage as satisfying CRUD on the same resource', () => {
    const held = new Set(['users:manage']);
    assert.equal(permissionSatisfied(held, 'users:create'), true);
    assert.equal(permissionSatisfied(held, 'users:read'), true);
    assert.equal(permissionSatisfied(held, 'users:update'), true);
    assert.equal(permissionSatisfied(held, 'users:delete'), true);
    assert.equal(permissionSatisfied(held, 'users:manage'), true);
    assert.equal(permissionSatisfied(held, 'roles:read'), false);
  });

  it('requires exact match when manage is absent', () => {
    const held = new Set(['reports:read']);
    assert.equal(permissionSatisfied(held, 'reports:read'), true);
    assert.equal(permissionSatisfied(held, 'reports:update'), false);
  });

  it('anyPermissionSatisfied is OR across required keys', () => {
    const held = new Set(['watchlists:create']);
    assert.equal(anyPermissionSatisfied(held, ['watchlists:create', 'watchlists:manage']), true);
    assert.equal(anyPermissionSatisfied(held, ['users:manage']), false);
  });

  it('enforces role hierarchy for assignment', () => {
    assert.equal(canAssignRole(RBAC_ROLE_RANK.owner, 'admin'), true);
    assert.equal(canAssignRole(RBAC_ROLE_RANK.admin, 'manager'), true);
    assert.equal(canAssignRole(RBAC_ROLE_RANK.admin, 'owner'), false);
    assert.equal(canAssignRole(RBAC_ROLE_RANK.admin, 'admin'), false);
    assert.equal(canAssignRole(RBAC_ROLE_RANK.manager, 'analyst'), true);
    assert.equal(canAssignRole(RBAC_ROLE_RANK.viewer, 'analyst'), false);
  });
});
