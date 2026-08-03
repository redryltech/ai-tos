import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@ai-tos/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/rbac/permissions.decorator';
import { PermissionGuard } from '../../common/rbac/permission.guard';
import { Roles } from '../../common/rbac/roles.decorator';
import { RolesGuard } from '../../common/rbac/roles.guard';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RbacService } from './rbac.service';

@ApiTags('rbac')
@ApiBearerAuth()
@Controller()
export class RbacController {
  constructor(private readonly rbac: RbacService) {}

  private requireUser(user?: AuthUser): AuthUser {
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Get('rbac/roles')
  @ApiOperation({ summary: 'List system RBAC roles' })
  async roles(@CurrentUser() user: AuthUser | undefined) {
    this.requireUser(user);
    const data = await this.rbac.listRoles();
    return { data, error: null };
  }

  @Get('rbac/permissions')
  @ApiOperation({ summary: 'List RBAC permissions' })
  async permissions(@CurrentUser() user: AuthUser | undefined) {
    this.requireUser(user);
    const data = await this.rbac.listPermissions();
    return { data, error: null };
  }

  @Get('organizations/:orgId/rbac/me')
  @ApiOperation({ summary: 'List my RBAC roles in an organization' })
  async myRoles(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.rbac.listMyRoles(u, orgId);
    return { data, error: null };
  }

  @Get('organizations/:orgId/rbac/assignments')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List role assignments in an organization' })
  async assignments(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.rbac.listAssignments(u, orgId);
    return { data, error: null };
  }

  @Post('organizations/:orgId/rbac/assignments')
  @UseGuards(RolesGuard, PermissionGuard)
  @Roles('owner', 'admin')
  @RequirePermissions('roles:manage')
  @ApiOperation({ summary: 'Assign an RBAC role to an org member' })
  async assign(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() body: AssignRoleDto,
  ) {
    const u = this.requireUser(user);
    const data = await this.rbac.assignRole(u, orgId, body.userId, body.roleKey);
    return { data, error: null };
  }

  @Delete('organizations/:orgId/rbac/assignments/:assignmentId')
  @UseGuards(RolesGuard, PermissionGuard)
  @Roles('owner', 'admin')
  @RequirePermissions('roles:manage')
  @ApiOperation({ summary: 'Revoke an RBAC role assignment' })
  async revoke(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.rbac.revokeAssignment(u, orgId, assignmentId);
    return { data, error: null };
  }
}
