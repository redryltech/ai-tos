import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadConfig } from '@ai-tos/config';
import type { AuthTokenPayload } from '@ai-tos/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: loadConfig().JWT_SECRET,
    });
  }

  validate(payload: AuthTokenPayload): { sub: string; role: AuthTokenPayload['role'] } {
    return { sub: payload.sub, role: payload.role };
  }
}
