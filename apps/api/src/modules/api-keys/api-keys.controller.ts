import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@ai-tos/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../../common/rbac/roles.decorator';
import { RolesGuard } from '../../common/rbac/roles.guard';
import { RequirePermissions } from '../../common/rbac/permissions.decorator';
import { PermissionGuard } from '../../common/rbac/permission.guard';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import { ApiKeysService } from './api-keys.service';

@ApiTags('api-keys')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionGuard)
@Roles('owner', 'admin')
@RequirePermissions('api_keys:manage')
@Controller('organizations/:orgId/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeys: ApiKeysService) {}

  private requireUser(user?: AuthUser): AuthUser {
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create encrypted organization API key (Owner/Admin)' })
  async create(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() body: CreateApiKeyDto,
  ) {
    const u = this.requireUser(user);
    const data = await this.apiKeys.create(u, orgId, body);
    return { data, error: null };
  }

  @Get()
  @ApiOperation({ summary: 'List organization API keys (metadata only)' })
  async list(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ) {
    this.requireUser(user);
    const data = await this.apiKeys.list(orgId);
    return { data, error: null };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization API key metadata' })
  async get(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.requireUser(user);
    const data = await this.apiKeys.get(orgId, id);
    return { data, error: null };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update API key metadata and/or rotate secret' })
  async update(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateApiKeyDto,
  ) {
    const u = this.requireUser(user);
    const data = await this.apiKeys.update(u, orgId, id, body);
    return { data, error: null };
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an organization API key' })
  async revoke(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.apiKeys.revoke(u, orgId, id);
    return { data, error: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an organization API key' })
  async remove(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const u = this.requireUser(user);
    await this.apiKeys.remove(u, orgId, id);
    return { data: { success: true }, error: null };
  }
}
