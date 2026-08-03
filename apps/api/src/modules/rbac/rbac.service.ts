import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import type { AuthUser, PermissionKey, RbacRoleKey } from '@ai-tos/shared';
import { canAssignRole, permissionSatisfied } from './rbac.policy';
import { RbacRepository } from './rbac.repository';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class RbacService {
  constructor(
    private readonly repo: RbacRepository,
    @Inject(forwardRef(() => AuditLogsService))
    private readonly audit: AuditLogsService,
  ) {}

  listRoles() {
    return this.repo.listRoles();
  }

  listPermissions() {
    return this.repo.listPermissions();
  }

  async listAssignments(actor: AuthUser, organizationId: string) {
    await this.requireMember(organizationId, actor.id);
    return this.repo.listOrgRoleAssignments(organizationId);
  }

  async listMyRoles(actor: AuthUser, organizationId: string) {
    await this.requireMember(organizationId, actor.id);
    return this.repo.listUserRoles(organizationId, actor.id);
  }

  async getPermissionKeys(organizationId: string, userId: string): Promise<Set<string>> {
    const keys = await this.repo.listUserPermissionKeys(organizationId, userId);
    return new Set(keys);
  }

  async hasAnyRole(
    organizationId: string,
    userId: string,
    roles: readonly RbacRoleKey[],
  ): Promise<boolean> {
    const assigned = await this.repo.listUserRoles(organizationId, userId);
    return assigned.some((r) => roles.includes(r.role_key));
  }

  async hasPermission(
    organizationId: string,
    userId: string,
    required: PermissionKey,
  ): Promise<boolean> {
    const held = await this.getPermissionKeys(organizationId, userId);
    return permissionSatisfied(held, required);
  }

  async hasAnyPermission(
    organizationId: string,
    userId: string,
    required: readonly PermissionKey[],
  ): Promise<boolean> {
    const held = await this.getPermissionKeys(organizationId, userId);
    return required.some((p) => permissionSatisfied(held, p));
  }

  /** Called when an organization is created — grants Owner RBAC role. */
  async grantSystemRole(
    organizationId: string,
    userId: string,
    roleKey: RbacRoleKey,
    assignedBy: string,
  ) {
    const role = await this.repo.findRoleByKey(roleKey);
    if (!role) throw new NotFoundException(`RBAC role '${roleKey}' not seeded`);
    return this.repo.assignRole({
      organizationId,
      userId,
      roleId: role.id,
      assignedBy,
    });
  }

  async assignRole(
    actor: AuthUser,
    organizationId: string,
    targetUserId: string,
    roleKey: RbacRoleKey,
  ) {
    if (roleKey === 'owner') {
      throw new ForbiddenException('Cannot assign Owner role via API');
    }
    await this.requireMember(organizationId, actor.id);
    const isMember = await this.repo.isOrgMember(organizationId, targetUserId);
    if (!isMember) {
      throw new BadRequestException('Target user is not a member of this organization');
    }

    const canManage = await this.hasPermission(organizationId, actor.id, 'roles:manage');
    if (!canManage) throw new ForbiddenException('Missing roles:manage permission');

    const actorRank = await this.repo.maxRoleRank(organizationId, actor.id);
    if (!canAssignRole(actorRank, roleKey)) {
      throw new ForbiddenException('Cannot assign a role at or above your rank');
    }

    const role = await this.repo.findRoleByKey(roleKey);
    if (!role) throw new NotFoundException(`RBAC role '${roleKey}' not found`);

    const assigned = await this.repo.assignRole({
      organizationId,
      userId: targetUserId,
      roleId: role.id,
      assignedBy: actor.id,
    });
    await this.audit.record({
      action: 'rbac.role_assign',
      organizationId,
      userId: actor.id,
      resourceId: assigned.id,
      metadata: { targetUserId, roleKey },
    });
    return assigned;
  }

  async revokeAssignment(actor: AuthUser, organizationId: string, assignmentId: string) {
    await this.requireMember(organizationId, actor.id);
    const canManage = await this.hasPermission(organizationId, actor.id, 'roles:manage');
    if (!canManage) throw new ForbiddenException('Missing roles:manage permission');

    const assignments = await this.repo.listOrgRoleAssignments(organizationId);
    const target = assignments.find((a) => a.id === assignmentId);
    if (!target) throw new NotFoundException('Role assignment not found');

    if (target.role_key === 'owner') {
      throw new ForbiddenException('Cannot revoke Owner role via API');
    }

    const actorRank = await this.repo.maxRoleRank(organizationId, actor.id);
    if (!canAssignRole(actorRank, target.role_key)) {
      throw new ForbiddenException('Cannot revoke a role at or above your rank');
    }

    const ok = await this.repo.revokeAssignment(assignmentId, organizationId);
    if (!ok) throw new NotFoundException('Role assignment not found');
    await this.audit.record({
      action: 'rbac.role_revoke',
      organizationId,
      userId: actor.id,
      resourceId: assignmentId,
      metadata: { targetUserId: target.user_id, roleKey: target.role_key },
    });
    return { success: true as const };
  }

  private async requireMember(organizationId: string, userId: string): Promise<void> {
    const ok = await this.repo.isOrgMember(organizationId, userId);
    if (!ok) throw new ForbiddenException('Not a member of this organization');
  }
}
