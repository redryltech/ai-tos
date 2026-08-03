import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import type { RbacRoleKey } from '@ai-tos/shared';

export interface RbacRoleRow {
  id: string;
  key: RbacRoleKey;
  name: string;
  description: string | null;
  is_system: boolean;
  rank: number;
}

export interface RbacPermissionRow {
  id: string;
  resource: string;
  action: string;
  key: string;
  description: string | null;
}

export interface OrgUserRoleRow {
  id: string;
  organization_id: string;
  user_id: string;
  role_id: string;
  role_key: RbacRoleKey;
  role_name: string;
  assigned_by: string | null;
  created_at: Date;
}

@Injectable()
export class RbacRepository {
  async listRoles(): Promise<RbacRoleRow[]> {
    const result = await query(
      `SELECT id, key, name, description, is_system, rank
       FROM rbac_roles
       ORDER BY rank DESC`,
    );
    return result.rows as RbacRoleRow[];
  }

  async listPermissions(): Promise<RbacPermissionRow[]> {
    const result = await query(
      `SELECT id, resource, action, key, description
       FROM rbac_permissions
       ORDER BY resource, action`,
    );
    return result.rows as RbacPermissionRow[];
  }

  async findRoleByKey(key: RbacRoleKey): Promise<RbacRoleRow | null> {
    const result = await query(
      `SELECT id, key, name, description, is_system, rank
       FROM rbac_roles WHERE key = $1`,
      [key],
    );
    return (result.rows[0] as RbacRoleRow | undefined) ?? null;
  }

  async listUserRoles(organizationId: string, userId: string): Promise<OrgUserRoleRow[]> {
    const result = await query(
      `SELECT our.id, our.organization_id, our.user_id, our.role_id,
              r.key AS role_key, r.name AS role_name, our.assigned_by, our.created_at
       FROM organization_user_roles our
       JOIN rbac_roles r ON r.id = our.role_id
       WHERE our.organization_id = $1 AND our.user_id = $2
       ORDER BY r.rank DESC`,
      [organizationId, userId],
    );
    return result.rows as OrgUserRoleRow[];
  }

  async listOrgRoleAssignments(organizationId: string): Promise<OrgUserRoleRow[]> {
    const result = await query(
      `SELECT our.id, our.organization_id, our.user_id, our.role_id,
              r.key AS role_key, r.name AS role_name, our.assigned_by, our.created_at
       FROM organization_user_roles our
       JOIN rbac_roles r ON r.id = our.role_id
       WHERE our.organization_id = $1
       ORDER BY our.created_at DESC`,
      [organizationId],
    );
    return result.rows as OrgUserRoleRow[];
  }

  async listUserPermissionKeys(
    organizationId: string,
    userId: string,
  ): Promise<string[]> {
    const result = await query(
      `SELECT DISTINCT p.key
       FROM organization_user_roles our
       JOIN rbac_role_permissions rp ON rp.role_id = our.role_id
       JOIN rbac_permissions p ON p.id = rp.permission_id
       WHERE our.organization_id = $1 AND our.user_id = $2`,
      [organizationId, userId],
    );
    return (result.rows as { key: string }[]).map((r) => r.key);
  }

  async assignRole(params: {
    organizationId: string;
    userId: string;
    roleId: string;
    assignedBy: string;
  }): Promise<OrgUserRoleRow> {
    const result = await query(
      `INSERT INTO organization_user_roles (organization_id, user_id, role_id, assigned_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, user_id, role_id) DO UPDATE
         SET assigned_by = EXCLUDED.assigned_by
       RETURNING id, organization_id, user_id, role_id, assigned_by, created_at`,
      [params.organizationId, params.userId, params.roleId, params.assignedBy],
    );
    const row = result.rows[0] as {
      id: string;
      organization_id: string;
      user_id: string;
      role_id: string;
      assigned_by: string | null;
      created_at: Date;
    };
    const role = await query(`SELECT key, name FROM rbac_roles WHERE id = $1`, [params.roleId]);
    const roleRow = role.rows[0] as { key: RbacRoleKey; name: string };
    return {
      ...row,
      role_key: roleRow.key,
      role_name: roleRow.name,
    };
  }

  async revokeAssignment(assignmentId: string, organizationId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM organization_user_roles
       WHERE id = $1 AND organization_id = $2`,
      [assignmentId, organizationId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async isOrgMember(organizationId: string, userId: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId],
    );
    return result.rows.length > 0;
  }

  async maxRoleRank(organizationId: string, userId: string): Promise<number> {
    const result = await query(
      `SELECT COALESCE(MAX(r.rank), 0) AS max_rank
       FROM organization_user_roles our
       JOIN rbac_roles r ON r.id = our.role_id
       WHERE our.organization_id = $1 AND our.user_id = $2`,
      [organizationId, userId],
    );
    return Number((result.rows[0] as { max_rank: string | number }).max_rank);
  }
}
