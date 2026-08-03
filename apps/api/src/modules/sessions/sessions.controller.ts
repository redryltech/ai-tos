import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { loadConfig } from '@ai-tos/config';
import type { AuthUser } from '@ai-tos/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { readCookie } from '../auth/auth.cookies';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-organization-id',
  required: false,
  description: 'Optional organization context',
})
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  private requireUser(user?: AuthUser): AuthUser {
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private readRefresh(req: Request): string | undefined {
    const cfg = loadConfig();
    const fromBody = (req.body as { refreshToken?: string } | undefined)?.refreshToken;
    return fromBody ?? readCookie(req, cfg.AUTH_COOKIE_REFRESH_NAME);
  }

  @Get()
  @ApiOperation({ summary: 'List active sessions for the authenticated user' })
  async list(
    @CurrentUser() user: AuthUser | undefined,
    @Req() req: Request,
    @Headers('x-organization-id') _orgId?: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.sessions.listMine(u, this.readRefresh(req));
    return { data, error: null };
  }

  @Post('revoke-current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current session (from refresh cookie/token)' })
  async revokeCurrent(@CurrentUser() user: AuthUser | undefined, @Req() req: Request) {
    const u = this.requireUser(user);
    const raw = this.readRefresh(req);
    if (!raw) throw new UnauthorizedException('Refresh token required to identify current session');
    const data = await this.sessions.revokeCurrent(u, raw);
    return { data, error: null };
  }

  @Post('revoke-others')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all other sessions except the current one' })
  async revokeOthers(@CurrentUser() user: AuthUser | undefined, @Req() req: Request) {
    const u = this.requireUser(user);
    const raw = this.readRefresh(req);
    if (!raw) throw new UnauthorizedException('Refresh token required to identify current session');
    const data = await this.sessions.revokeOthers(u, raw);
    return { data, error: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session owned by the authenticated user' })
  async revokeOne(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.sessions.revokeOne(u, id);
    return { data, error: null };
  }
}
