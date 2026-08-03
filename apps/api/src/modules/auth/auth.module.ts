import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { loadConfig } from '@ai-tos/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { UsersRepository } from './users.repository';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { SessionsModule } from '../sessions/sessions.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: loadConfig().JWT_SECRET,
      signOptions: { expiresIn: loadConfig().JWT_EXPIRES_IN },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    forwardRef(() => SessionsModule),
    AuditLogsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    UsersRepository,
    RefreshTokensRepository,
    JwtStrategy,
    JwtAuthGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [AuthService, PasswordService, TokenService, JwtAuthGuard],
})
export class AuthModule {}
