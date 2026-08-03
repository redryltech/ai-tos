import type { AuditAction, AuditLog } from '@ai-tos/shared';

/** Manager team-scoped audit resources (existing authorization model). */
export const MANAGER_AUDIT_RESOURCES = [
  'users',
  'roles',
  'reports',
  'watchlists',
  'session',
] as const;

export function isManagerTeamAuditResource(resource: string): boolean {
  return (MANAGER_AUDIT_RESOURCES as readonly string[]).includes(resource);
}

export function resourceForAction(action: AuditAction): string {
  const [resource] = action.split('.');
  if (resource === 'auth') return 'auth';
  if (resource === 'rbac') return 'roles';
  if (resource === 'api_key') return 'api_keys';
  if (resource === 'profile') return 'profile';
  if (resource === 'session') return 'session';
  if (resource === 'organization') return 'organization';
  return resource;
}

export interface AuditLogRow {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export function toPublicAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    metadata: row.metadata ?? {},
    createdAt: row.created_at.toISOString(),
  };
}
