import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import type { AuthUser, UserPublic } from '@ai-tos/shared';
import { PasswordService } from './password.service';
import { TokenService, type TokenPair } from './token.service';
import { UsersRepository } from './users.repository';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { SessionsService } from '../sessions/sessions.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

export interface AuthResult {
  user: UserPublic;
  tokens: TokenPair;
}

export interface AuthRequestMeta {
  userAgent?: string;
  ipAddress?: string;
  organizationId?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionsService,
    private readonly audit: AuditLogsService,
  ) {}

  async login(email: string, password: string, meta?: AuthRequestMeta): Promise<AuthResult> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.is_active) {
      throw new ForbiddenException('Account is disabled');
    }

    const ok = await this.passwords.verify(user.password_hash, password);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
    const pair = this.tokens.issuePair(authUser);
    const expiresAt = new Date(Date.now() + pair.refreshExpiresInMs);
    const refresh = await this.refreshTokens.create({
      userId: user.id,
      jti: pair.refreshJti,
      rawToken: pair.refreshToken,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });
    await this.sessions.createOnLogin({
      userId: user.id,
      organizationId: meta?.organizationId,
      refreshTokenId: refresh.id,
      rawRefreshToken: pair.refreshToken,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt,
    });

    await this.audit.record({
      action: 'auth.login',
      userId: user.id,
      organizationId: meta?.organizationId,
      resourceId: user.id,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      tokens: pair,
    };
  }

  async refresh(rawRefreshToken: string, meta?: AuthRequestMeta): Promise<AuthResult> {
    const payload = this.tokens.verifyRefresh(rawRefreshToken);
    const stored = await this.refreshTokens.findValid(payload.jti, rawRefreshToken);
    if (!stored) {
      throw new UnauthorizedException('Refresh token revoked or unknown');
    }

    const user = await this.users.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new ForbiddenException('Account is disabled');
    }

    await this.refreshTokens.revokeByJti(payload.jti);

    const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
    const pair = this.tokens.issuePair(authUser);
    const expiresAt = new Date(Date.now() + pair.refreshExpiresInMs);
    const refresh = await this.refreshTokens.create({
      userId: user.id,
      jti: pair.refreshJti,
      rawToken: pair.refreshToken,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    const rotated = await this.sessions.rotateOnRefresh({
      previousRefreshTokenId: stored.id,
      refreshTokenId: refresh.id,
      rawRefreshToken: pair.refreshToken,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      organizationId: meta?.organizationId,
    });
    if (!rotated) {
      await this.sessions.createOnLogin({
        userId: user.id,
        organizationId: meta?.organizationId,
        refreshTokenId: refresh.id,
        rawRefreshToken: pair.refreshToken,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt,
      });
    }

    await this.audit.record({
      action: 'auth.token_refresh',
      userId: user.id,
      organizationId: meta?.organizationId,
      resourceId: user.id,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      tokens: pair,
    };
  }

  async logout(rawRefreshToken?: string, userId?: string, meta?: AuthRequestMeta): Promise<void> {
    let auditUserId = userId;
    if (rawRefreshToken) {
      try {
        const payload = this.tokens.verifyRefresh(rawRefreshToken);
        auditUserId = payload.sub;
        const refreshId = await this.refreshTokens.findIdByJti(payload.jti);
        await this.refreshTokens.revokeByJti(payload.jti);
        await this.sessions.revokeByRefreshToken(rawRefreshToken, refreshId ?? undefined);
        await this.audit.record({
          action: 'auth.logout',
          userId: auditUserId,
          organizationId: meta?.organizationId,
          resourceId: auditUserId,
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        });
        return;
      } catch {
        // fall through — still clear cookies client-side
      }
    }
    if (userId) {
      await this.sessions.revokeAllForUser(userId);
      await this.refreshTokens.revokeAllForUser(userId);
      await this.audit.record({
        action: 'auth.logout',
        userId,
        organizationId: meta?.organizationId,
        resourceId: userId,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        metadata: { scope: 'all_sessions' },
      });
    }
  }
}
