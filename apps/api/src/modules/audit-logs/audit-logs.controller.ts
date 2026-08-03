import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
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
import { ListAuditLogsQueryDto } from './dto/list-audit-logs.dto';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionGuard)
@Roles('owner', 'admin', 'manager')
@RequirePermissions('audit_logs:read')
@Controller('organizations/:orgId/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogs: AuditLogsService) {}

  private requireUser(user?: AuthUser): AuthUser {
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Get()
  @ApiOperation({
    summary: 'List organization audit logs (Owner/Admin; Manager team-scoped)',
  })
  async list(
    @CurrentUser() user: AuthUser | undefined,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    const u = this.requireUser(user);
    const data = await this.auditLogs.listForOrganization(u, orgId, query);
    return { data, error: null };
  }
}
