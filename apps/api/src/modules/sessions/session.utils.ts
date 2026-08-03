import type { UserSession } from '@ai-tos/shared';

export interface UserSessionRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  refresh_token_id: string | null;
  refresh_token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: Date;
  last_active_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
}

export function isSessionActive(row: {
  revoked_at: Date | null;
  expires_at: Date;
  now?: Date;
}): boolean {
  const now = row.now ?? new Date();
  return row.revoked_at == null && row.expires_at.getTime() > now.getTime();
}

export function toPublicSession(
  row: UserSessionRow,
  opts?: { isCurrent?: boolean },
): UserSession {
  return {
    id: row.id,
    userId: row.user_id,
    organizationId: row.organization_id,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
    createdAt: row.created_at.toISOString(),
    lastActiveAt: row.last_active_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
    revokedAt: row.revoked_at ? row.revoked_at.toISOString() : null,
    ...(opts?.isCurrent !== undefined ? { isCurrent: opts.isCurrent } : {}),
  };
}
