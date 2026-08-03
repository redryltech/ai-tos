import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser, UserSession } from '@ai-tos/shared';
import { hashToken } from '../auth/auth.cookies';
import { isSessionActive, toPublicSession } from './session.utils';
import { SessionsRepository } from './sessions.repository';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

export interface SessionCreateInput {
  userId: string;
  organizationId?: string | null;
  refreshTokenId: string;
  rawRefreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly repo: SessionsRepository,
    private readonly audit: AuditLogsService,
  ) {}

  /** Called by AuthService on login. */
  async createOnLogin(input: SessionCreateInput): Promise<UserSession> {
    const row = await this.repo.create({
      userId: input.userId,
      organizationId: input.organizationId,
      refreshTokenId: input.refreshTokenId,
      refreshTokenHash: hashToken(input.rawRefreshToken),
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: input.expiresAt,
    });
    return toPublicSession(row);
  }

  /** Called by AuthService on refresh rotation — keeps the same session row. */
  async rotateOnRefresh(params: {
    previousRefreshTokenId: string;
    refreshTokenId: string;
    rawRefreshToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    organizationId?: string | null;
  }): Promise<UserSession | null> {
    const existing = await this.repo.findActiveByRefreshTokenId(params.previousRefreshTokenId);
    if (!existing) {
      // Fallback: create a new session if orphaned (should be rare).
      return null;
    }
    const row = await this.repo.rotateRefreshToken({
      sessionId: existing.id,
      refreshTokenId: params.refreshTokenId,
      refreshTokenHash: hashToken(params.rawRefreshToken),
      expiresAt: params.expiresAt,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      organizationId: params.organizationId,
    });
    return row ? toPublicSession(row) : null;
  }

  /** Called by AuthService on logout (by refresh token). */
  async revokeByRefreshToken(rawRefreshToken: string, refreshTokenId?: string): Promise<void> {
    if (refreshTokenId) {
      await this.repo.revokeByRefreshTokenId(refreshTokenId);
      await this.repo.revokeRefreshTokenById(refreshTokenId);
      return;
    }
    await this.repo.revokeByRefreshHash(hashToken(rawRefreshToken));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.revokeRefreshTokensForSessions(userId);
    await this.repo.revokeAllForUser(userId);
  }

  async listMine(user: AuthUser, rawRefreshToken?: string): Promise<UserSession[]> {
    const rows = await this.repo.listActiveForUser(user.id);
    const currentHash = rawRefreshToken ? hashToken(rawRefreshToken) : null;
    return rows.map((row) =>
      toPublicSession(row, {
        isCurrent: currentHash ? row.refresh_token_hash === currentHash : false,
      }),
    );
  }

  async revokeCurrent(user: AuthUser, rawRefreshToken: string): Promise<{ success: true }> {
    const hash = hashToken(rawRefreshToken);
    const session = await this.repo.findActiveByRefreshHash(hash);
    if (!session || session.user_id !== user.id) {
      throw new NotFoundException('Current session not found');
    }
    await this.revokeOwnedSession(user.id, session);
    return { success: true };
  }

  async revokeOne(user: AuthUser, sessionId: string): Promise<{ success: true }> {
    const session = await this.repo.findByIdForUser(user.id, sessionId);
    if (!session || !isSessionActive(session)) {
      throw new NotFoundException('Session not found');
    }
    await this.revokeOwnedSession(user.id, session);
    return { success: true };
  }

  async revokeOthers(user: AuthUser, rawRefreshToken: string): Promise<{ revoked: number }> {
    const hash = hashToken(rawRefreshToken);
    const current = await this.repo.findActiveByRefreshHash(hash);
    if (!current || current.user_id !== user.id) {
      throw new NotFoundException('Current session not found');
    }
    await this.repo.revokeRefreshTokensForSessions(user.id, current.id);
    const revoked = await this.repo.revokeOthersForUser(user.id, current.id);
    await this.audit.record({
      action: 'session.revoke',
      userId: user.id,
      organizationId: current.organization_id,
      resourceId: current.id,
      metadata: { scope: 'others', revoked },
    });
    return { revoked };
  }

  private async revokeOwnedSession(
    userId: string,
    session: {
      id: string;
      refresh_token_id: string | null;
      organization_id?: string | null;
    },
  ): Promise<void> {
    if (session.refresh_token_id) {
      await this.repo.revokeRefreshTokenById(session.refresh_token_id);
    }
    await this.repo.revokeById(userId, session.id);
    await this.audit.record({
      action: 'session.revoke',
      userId,
      organizationId: session.organization_id,
      resourceId: session.id,
    });
  }
}
