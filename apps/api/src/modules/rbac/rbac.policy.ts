import type { PermissionKey, RbacAction, RbacResource, RbacRoleKey } from '@ai-tos/shared';

/** Pure helper: `manage` implies create/read/update/delete on the same resource. */
export function permissionSatisfied(
  held: ReadonlySet<string>,
  required: PermissionKey,
): boolean {
  if (held.has(required)) return true;
  const [resource, action] = required.split(':') as [RbacResource, RbacAction];
  if (action !== 'manage' && held.has(`${resource}:manage`)) return true;
  return false;
}

export function anyPermissionSatisfied(
  held: ReadonlySet<string>,
  required: readonly PermissionKey[],
): boolean {
  return required.some((p) => permissionSatisfied(held, p));
}

/** Rank used for assignment policy (cannot assign/revoke equal-or-higher roles). */
export const RBAC_ROLE_RANK: Record<RbacRoleKey, number> = {
  owner: 100,
  admin: 80,
  manager: 60,
  analyst: 40,
  viewer: 20,
};

export function canAssignRole(actorMaxRank: number, targetRole: RbacRoleKey): boolean {
  return actorMaxRank > RBAC_ROLE_RANK[targetRole];
}
