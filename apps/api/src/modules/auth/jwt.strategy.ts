import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadConfig } from '@ai-tos/config';
import type { AuthTokenPayload, AuthUser } from '@ai-tos/shared';
import type { Request } from 'express';

function fromCookieOrBearer(req: Request): string | null {
  const cfg = loadConfig();
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  const cookieToken = cookies?.[cfg.AUTH_COOKIE_ACCESS_NAME];
  if (cookieToken) return cookieToken;
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: fromCookieOrBearer,
      ignoreExpiration: false,
      secretOrKey: loadConfig().JWT_SECRET,
    });
  }

  validate(payload: AuthTokenPayload): AuthUser {
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Malformed access token');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
