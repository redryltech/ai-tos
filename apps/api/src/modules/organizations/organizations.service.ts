import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { AuthUser, Organization, OrgMemberRole, PermissionKey, RbacRoleKey } from '@ai-tos/shared';
import { OrganizationsRepository, type OrganizationRow } from './organizations.repository';
import { isValidSlug, slugify } from './org.utils';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

function toPublic(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/** Map invite membership label → RBAC role (authorization assignment). */
function inviteRoleToRbac(role: OrgMemberRole): RbacRoleKey {
  if (role === 'admin') return 'admin';
  if (role === 'owner') return 'owner';
  return 'viewer';
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly repo: OrganizationsRepository,
    private readonly rbac: RbacService,
    private readonly audit: AuditLogsService,
  ) {}

  async create(user: AuthUser, name: string, slugInput?: string): Promise<Organization> {
    const slug = slugInput ? slugInput.toLowerCase() : slugify(name);
    if (!isValidSlug(slug)) {
      throw new BadRequestException('Invalid organization slug');
    }
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    const org = await this.repo.create({
      name: name.trim(),
      slug,
      createdBy: user.id,
    });
    // Membership row = tenancy only; RBAC Owner grant = authorization.
    await this.repo.addMember({
      organizationId: org.id,
      userId: user.id,
      role: 'owner',
    });
    await this.rbac.grantSystemRole(org.id, user.id, 'owner', user.id);
    const created = toPublic(org);
    await this.audit.record({
      action: 'organization.create',
      organizationId: org.id,
      userId: user.id,
      resourceId: org.id,
      metadata: { slug: org.slug },
    });
    return created;
  }

  async listMine(user: AuthUser): Promise<Organization[]> {
    const rows = await this.repo.listForUser(user.id);
    return rows.map(toPublic);
  }

  async get(user: AuthUser, orgId: string): Promise<Organization> {
    await this.requireMember(orgId, user.id);
    const org = await this.repo.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found');
    return toPublic(org);
  }

  async update(
    user: AuthUser,
    orgId: string,
    patch: { name?: string; slug?: string },
  ): Promise<Organization> {
    await this.requirePermission(orgId, user.id, 'organization:update');
    if (patch.slug) {
      const slug = patch.slug.toLowerCase();
      if (!isValidSlug(slug)) throw new BadRequestException('Invalid organization slug');
      const clash = await this.repo.findBySlug(slug);
      if (clash && clash.id !== orgId) {
        throw new ConflictException('Organization slug already exists');
      }
      patch.slug = slug;
    }
    const updated = await this.repo.update(orgId, patch);
    if (!updated) throw new NotFoundException('Organization not found');
    const pub = toPublic(updated);
    await this.audit.record({
      action: 'organization.update',
      organizationId: orgId,
      userId: user.id,
      resourceId: orgId,
      metadata: patch,
    });
    return pub;
  }

  async remove(user: AuthUser, orgId: string): Promise<void> {
    // Owner-only via RBAC (Admin intentionally lacks organization:delete/manage).
    await this.requirePermission(orgId, user.id, 'organization:delete');
    const ok = await this.repo.delete(orgId);
    if (!ok) throw new NotFoundException('Organization not found');
    await this.audit.record({
      action: 'organization.delete',
      organizationId: orgId,
      userId: user.id,
      resourceId: orgId,
    });
  }

  async listMembers(user: AuthUser, orgId: string) {
    await this.requireMember(orgId, user.id);
    return this.repo.listMembers(orgId);
  }

  async invite(
    user: AuthUser,
    orgId: string,
    email: string,
    role: 'admin' | 'member' = 'member',
  ): Promise<{ inviteId: string; token: string; expiresAt: string }> {
    await this.requirePermission(orgId, user.id, 'users:manage');
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await this.repo.createInvite({
      organizationId: orgId,
      email,
      role,
      tokenHash,
      invitedBy: user.id,
      expiresAt,
    });
    await this.audit.record({
      action: 'organization.invite',
      organizationId: orgId,
      userId: user.id,
      resourceId: invite.id,
      metadata: { email, role },
    });
    return {
      inviteId: invite.id,
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async acceptInvite(user: AuthUser, rawToken: string): Promise<Organization> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const invite = await this.repo.findValidInvite(tokenHash);
    if (!invite) throw new NotFoundException('Invite not found or expired');
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('Invite email does not match authenticated user');
    }

    await this.repo.addMember({
      organizationId: invite.organization_id,
      userId: user.id,
      role: invite.role,
    });
    await this.rbac.grantSystemRole(
      invite.organization_id,
      user.id,
      inviteRoleToRbac(invite.role),
      user.id,
    );
    await this.repo.acceptInvite(invite.id);

    const org = await this.repo.findById(invite.organization_id);
    if (!org) throw new NotFoundException('Organization not found');
    const pub = toPublic(org);
    await this.audit.record({
      action: 'organization.invite_accept',
      organizationId: org.id,
      userId: user.id,
      resourceId: invite.id,
    });
    return pub;
  }

  /** Membership check only — does not authorize privileged actions. */
  private async requireMember(orgId: string, userId: string): Promise<void> {
    const membership = await this.repo.getMembership(orgId, userId);
    if (!membership) throw new ForbiddenException('Not a member of this organization');
  }

  /** Authorization via organization_user_roles permissions (RBAC source of truth). */
  private async requirePermission(
    orgId: string,
    userId: string,
    permission: PermissionKey,
  ): Promise<void> {
    await this.requireMember(orgId, userId);
    const ok = await this.rbac.hasPermission(orgId, userId, permission);
    if (!ok) throw new ForbiddenException('Insufficient organization permissions');
  }
}
