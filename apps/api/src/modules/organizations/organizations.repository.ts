import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import type { OrgMemberRole } from '@ai-tos/shared';

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Membership row. `role` is a tenancy/invite label only —
 * authorization uses `organization_user_roles` (RBAC).
 */
export interface MemberRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  email?: string;
}

@Injectable()
export class OrganizationsRepository {
  async create(params: {
    name: string;
    slug: string;
    createdBy: string;
  }): Promise<OrganizationRow> {
    const result = await query(
      `INSERT INTO organizations (name, slug, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, created_by, created_at, updated_at`,
      [params.name, params.slug, params.createdBy],
    );
    return result.rows[0] as OrganizationRow;
  }

  async findById(id: string): Promise<OrganizationRow | null> {
    const result = await query(
      `SELECT id, name, slug, created_by, created_at, updated_at
       FROM organizations WHERE id = $1 LIMIT 1`,
      [id],
    );
    return (result.rows[0] as OrganizationRow | undefined) ?? null;
  }

  async findBySlug(slug: string): Promise<OrganizationRow | null> {
    const result = await query(
      `SELECT id, name, slug, created_by, created_at, updated_at
       FROM organizations WHERE slug = $1 LIMIT 1`,
      [slug],
    );
    return (result.rows[0] as OrganizationRow | undefined) ?? null;
  }

  async listForUser(userId: string): Promise<OrganizationRow[]> {
    const result = await query(
      `SELECT o.id, o.name, o.slug, o.created_by, o.created_at, o.updated_at
       FROM organizations o
       INNER JOIN organization_members m ON m.organization_id = o.id
       WHERE m.user_id = $1
       ORDER BY o.name ASC`,
      [userId],
    );
    return result.rows as OrganizationRow[];
  }

  async update(
    id: string,
    patch: { name?: string; slug?: string },
  ): Promise<OrganizationRow | null> {
    const result = await query(
      `UPDATE organizations
       SET name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           updated_at = now()
       WHERE id = $1
       RETURNING id, name, slug, created_by, created_at, updated_at`,
      [id, patch.name ?? null, patch.slug ?? null],
    );
    return (result.rows[0] as OrganizationRow | undefined) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM organizations WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async addMember(params: {
    organizationId: string;
    userId: string;
    role: OrgMemberRole;
  }): Promise<void> {
    await query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [params.organizationId, params.userId, params.role],
    );
  }

  async getMembership(
    organizationId: string,
    userId: string,
  ): Promise<MemberRow | null> {
    const result = await query(
      `SELECT id, organization_id, user_id, role
       FROM organization_members
       WHERE organization_id = $1 AND user_id = $2
       LIMIT 1`,
      [organizationId, userId],
    );
    return (result.rows[0] as MemberRow | undefined) ?? null;
  }

  async listMembers(organizationId: string): Promise<MemberRow[]> {
    const result = await query(
      `SELECT m.id, m.organization_id, m.user_id, m.role, u.email
       FROM organization_members m
       INNER JOIN users u ON u.id = m.user_id
       WHERE m.organization_id = $1
       ORDER BY m.role, u.email`,
      [organizationId],
    );
    return result.rows as MemberRow[];
  }

  async createInvite(params: {
    organizationId: string;
    email: string;
    role: 'admin' | 'member';
    tokenHash: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<{ id: string }> {
    const result = await query(
      `INSERT INTO organization_invites
         (organization_id, email, role, token_hash, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        params.organizationId,
        params.email.toLowerCase(),
        params.role,
        params.tokenHash,
        params.invitedBy,
        params.expiresAt.toISOString(),
      ],
    );
    return result.rows[0] as { id: string };
  }

  async findValidInvite(tokenHash: string): Promise<{
    id: string;
    organization_id: string;
    email: string;
    role: 'admin' | 'member';
  } | null> {
    const result = await query(
      `SELECT id, organization_id, email, role
       FROM organization_invites
       WHERE token_hash = $1
         AND revoked_at IS NULL
         AND accepted_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
      [tokenHash],
    );
    return (
      (result.rows[0] as
        | { id: string; organization_id: string; email: string; role: 'admin' | 'member' }
        | undefined) ?? null
    );
  }

  async acceptInvite(inviteId: string): Promise<void> {
    await query(
      `UPDATE organization_invites SET accepted_at = now() WHERE id = $1`,
      [inviteId],
    );
  }

  async findUserIdByEmail(email: string): Promise<string | null> {
    const result = await query(
      `SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1`,
      [email],
    );
    const row = result.rows[0] as { id: string } | undefined;
    return row?.id ?? null;
  }
}
