import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { loadConfig } from '@ai-tos/config';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { clearAuthCookies, readCookie, setAuthCookies } from './auth.cookies';
import type { AuthUser } from '@ai-tos/shared';

@ApiTags('auth')
@ApiHeader({
  name: 'x-organization-id',
  required: false,
  description: 'Optional organization context stored on the session',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-organization-id') organizationId?: string,
  ) {
    const result = await this.auth.login(body.email, body.password, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      organizationId,
    });
    setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken,
      result.tokens.accessExpiresInMs,
      result.tokens.refreshExpiresInMs,
    );
    return {
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: Math.floor(result.tokens.accessExpiresInMs / 1000),
      },
      error: null,
    };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue a new access token' })
  async refresh(
    @Body() body: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-organization-id') organizationId?: string,
  ) {
    const cfg = loadConfig();
    const raw = body.refreshToken ?? readCookie(req, cfg.AUTH_COOKIE_REFRESH_NAME);
    if (!raw) {
      throw new UnauthorizedException('Refresh token required');
    }

    const result = await this.auth.refresh(raw, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      organizationId,
    });
    setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken,
      result.tokens.accessExpiresInMs,
      result.tokens.refreshExpiresInMs,
    );
    return {
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: Math.floor(result.tokens.accessExpiresInMs / 1000),
      },
      error: null,
    };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token/session and clear auth cookies' })
  async logout(
    @Body() body: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthUser,
  ) {
    const cfg = loadConfig();
    const raw = body.refreshToken ?? readCookie(req, cfg.AUTH_COOKIE_REFRESH_NAME);
    await this.auth.logout(raw, user?.id, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      organizationId: req.headers['x-organization-id'] as string | undefined,
    });
    clearAuthCookies(res);
    return { data: { success: true }, error: null };
  }
}
