import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import type { UserSessionRow } from './session.utils';

@Injectable()
export class SessionsRepository {
  async create(params: {
    userId: string;
    organizationId?: string | null;
    refreshTokenId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<UserSessionRow> {
    const result = await query(
      `INSERT INTO user_sessions (
         user_id, organization_id, refresh_token_id, refresh_token_hash,
         user_agent, ip_address, expires_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, organization_id, refresh_token_id, refresh_token_hash,
                 user_agent, ip_address, created_at, last_active_at, expires_at, revoked_at`,
      [
        params.userId,
        params.organizationId ?? null,
        params.refreshTokenId,
        params.refreshTokenHash,
        params.userAgent ?? null,
        params.ipAddress ?? null,
        params.expiresAt.toISOString(),
      ],
    );
    return result.rows[0] as UserSessionRow;
  }

  async listActiveForUser(userId: string): Promise<UserSessionRow[]> {
    const result = await query(
      `SELECT id, user_id, organization_id, refresh_token_id, refresh_token_hash,
              user_agent, ip_address, created_at, last_active_at, expires_at, revoked_at
       FROM user_sessions
       WHERE user_id = $1
         AND revoked_at IS NULL
         AND expires_at > now()
       ORDER BY last_active_at DESC`,
      [userId],
    );
    return result.rows as UserSessionRow[];
  }

  async findByIdForUser(userId: string, sessionId: string): Promise<UserSessionRow | null> {
    const result = await query(
      `SELECT id, user_id, organization_id, refresh_token_id, refresh_token_hash,
              user_agent, ip_address, created_at, last_active_at, expires_at, revoked_at
       FROM user_sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId],
    );
    return (result.rows[0] as UserSessionRow | undefined) ?? null;
  }

  async findActiveByRefreshTokenId(refreshTokenId: string): Promise<UserSessionRow | null> {
    const result = await query(
      `SELECT id, user_id, organization_id, refresh_token_id, refresh_token_hash,
              user_agent, ip_address, created_at, last_active_at, expires_at, revoked_at
       FROM user_sessions
       WHERE refresh_token_id = $1
         AND revoked_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
      [refreshTokenId],
    );
    return (result.rows[0] as UserSessionRow | undefined) ?? null;
  }

  async findActiveByRefreshHash(refreshTokenHash: string): Promise<UserSessionRow | null> {
    const result = await query(
      `SELECT id, user_id, organization_id, refresh_token_id, refresh_token_hash,
              user_agent, ip_address, created_at, last_active_at, expires_at, revoked_at
       FROM user_sessions
       WHERE refresh_token_hash = $1
         AND revoked_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
      [refreshTokenHash],
    );
    return (result.rows[0] as UserSessionRow | undefined) ?? null;
  }

  async rotateRefreshToken(params: {
    sessionId: string;
    refreshTokenId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    organizationId?: string | null;
  }): Promise<UserSessionRow | null> {
    const result = await query(
      `UPDATE user_sessions SET
         refresh_token_id = $2,
         refresh_token_hash = $3,
         expires_at = $4,
         last_active_at = now(),
         user_agent = COALESCE($5, user_agent),
         ip_address = COALESCE($6, ip_address),
         organization_id = COALESCE($7, organization_id)
       WHERE id = $1 AND revoked_at IS NULL
       RETURNING id, user_id, organization_id, refresh_token_id, refresh_token_hash,
                 user_agent, ip_address, created_at, last_active_at, expires_at, revoked_at`,
      [
        params.sessionId,
        params.refreshTokenId,
        params.refreshTokenHash,
        params.expiresAt.toISOString(),
        params.userAgent ?? null,
        params.ipAddress ?? null,
        params.organizationId ?? null,
      ],
    );
    return (result.rows[0] as UserSessionRow | undefined) ?? null;
  }

  async touch(sessionId: string): Promise<void> {
    await query(
      `UPDATE user_sessions SET last_active_at = now()
       WHERE id = $1 AND revoked_at IS NULL`,
      [sessionId],
    );
  }

  async revokeById(userId: string, sessionId: string): Promise<UserSessionRow | null> {
    const result = await query(
      `UPDATE user_sessions SET revoked_at = now()
       WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
       RETURNING id, user_id, organization_id, refresh_token_id, refresh_token_hash,
                 user_agent, ip_address, created_at, last_active_at, expires_at, revoked_at`,
      [sessionId, userId],
    );
    return (result.rows[0] as UserSessionRow | undefined) ?? null;
  }

  async revokeByRefreshTokenId(refreshTokenId: string): Promise<void> {
    await query(
      `UPDATE user_sessions SET revoked_at = now()
       WHERE refresh_token_id = $1 AND revoked_at IS NULL`,
      [refreshTokenId],
    );
  }

  async revokeByRefreshHash(refreshTokenHash: string): Promise<void> {
    await query(
      `UPDATE user_sessions SET revoked_at = now()
       WHERE refresh_token_hash = $1 AND revoked_at IS NULL`,
      [refreshTokenHash],
    );
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await query(
      `UPDATE user_sessions SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
    return result.rowCount ?? 0;
  }

  async revokeOthersForUser(userId: string, keepSessionId: string): Promise<number> {
    const result = await query(
      `UPDATE user_sessions SET revoked_at = now()
       WHERE user_id = $1 AND id <> $2 AND revoked_at IS NULL`,
      [userId, keepSessionId],
    );
    return result.rowCount ?? 0;
  }

  async revokeRefreshTokenById(refreshTokenId: string): Promise<void> {
    await query(
      `UPDATE refresh_tokens SET revoked_at = now()
       WHERE id = $1 AND revoked_at IS NULL`,
      [refreshTokenId],
    );
  }

  async revokeRefreshTokensForSessions(
    userId: string,
    exceptSessionId?: string,
  ): Promise<void> {
    if (exceptSessionId) {
      await query(
        `UPDATE refresh_tokens rt SET revoked_at = now()
         FROM user_sessions s
         WHERE s.refresh_token_id = rt.id
           AND s.user_id = $1
           AND s.id <> $2
           AND rt.revoked_at IS NULL`,
        [userId, exceptSessionId],
      );
      return;
    }
    await query(
      `UPDATE refresh_tokens SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  }
}
