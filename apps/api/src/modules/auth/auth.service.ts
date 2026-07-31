import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@ai-tos/shared';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  /** Phase 0: issue a demo token for local UI testing. No user store yet. */
  issueDemoToken(role: Role = 'admin'): string {
    return this.jwt.sign({ sub: 'demo-user', role });
  }
}
