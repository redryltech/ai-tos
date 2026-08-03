import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { loadConfig } from '@ai-tos/config';
import type { AuthTokenPayload, AuthUser, Role } from '@ai-tos/shared';
import { durationToMs, newJti } from './auth.cookies';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessJti: string;
  refreshJti: string;
  accessExpiresInMs: number;
  refreshExpiresInMs: number;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  issuePair(user: AuthUser): TokenPair {
    const cfg = loadConfig();
    const accessJti = newJti();
    const refreshJti = newJti();
    const accessExpiresInMs = durationToMs(cfg.JWT_EXPIRES_IN);
    const refreshExpiresInMs = durationToMs(cfg.JWT_REFRESH_EXPIRES_IN);

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        typ: 'access',
        jti: accessJti,
      } satisfies AuthTokenPayload,
      { secret: cfg.JWT_SECRET, expiresIn: cfg.JWT_EXPIRES_IN },
    );

    const refreshToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        typ: 'refresh',
        jti: refreshJti,
      } satisfies AuthTokenPayload,
      { secret: cfg.JWT_REFRESH_SECRET, expiresIn: cfg.JWT_REFRESH_EXPIRES_IN },
    );

    return {
      accessToken,
      refreshToken,
      accessJti,
      refreshJti,
      accessExpiresInMs,
      refreshExpiresInMs,
    };
  }

  verifyAccess(token: string): AuthTokenPayload {
    try {
      const payload = this.jwt.verify<AuthTokenPayload>(token, {
        secret: loadConfig().JWT_SECRET,
      });
      if (payload.typ !== 'access') throw new UnauthorizedException('Invalid token type');
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  verifyRefresh(token: string): AuthTokenPayload {
    try {
      const payload = this.jwt.verify<AuthTokenPayload>(token, {
        secret: loadConfig().JWT_REFRESH_SECRET,
      });
      if (payload.typ !== 'refresh') throw new UnauthorizedException('Invalid token type');
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  toAuthUser(payload: AuthTokenPayload): AuthUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as Role,
    };
  }
}
