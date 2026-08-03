import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import { hashToken } from './auth.cookies';

@Injectable()
export class RefreshTokensRepository {
  async create(params: {
    userId: string;
    jti: string;
    rawToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{ id: string }> {
    const result = await query(
      `INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        params.userId,
        params.jti,
        hashToken(params.rawToken),
        params.expiresAt.toISOString(),
        params.userAgent ?? null,
        params.ipAddress ?? null,
      ],
    );
    return result.rows[0] as { id: string };
  }

  async findValid(
    jti: string,
    rawToken: string,
  ): Promise<{ id: string; user_id: string } | null> {
    const result = await query(
      `SELECT id, user_id FROM refresh_tokens
       WHERE jti = $1
         AND token_hash = $2
         AND revoked_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
      [jti, hashToken(rawToken)],
    );
    return (result.rows[0] as { id: string; user_id: string } | undefined) ?? null;
  }

  async findIdByJti(jti: string): Promise<string | null> {
    const result = await query(
      `SELECT id FROM refresh_tokens WHERE jti = $1 LIMIT 1`,
      [jti],
    );
    return ((result.rows[0] as { id: string } | undefined)?.id) ?? null;
  }

  async revokeByJti(jti: string): Promise<void> {
    await query(
      `UPDATE refresh_tokens SET revoked_at = now()
       WHERE jti = $1 AND revoked_at IS NULL`,
      [jti],
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await query(
      `UPDATE refresh_tokens SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  }
}
