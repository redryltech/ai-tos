import { Module, forwardRef } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacRepository } from './rbac.repository';
import { RbacService } from './rbac.service';
import { RolesGuard } from '../../common/rbac/roles.guard';
import { PermissionGuard } from '../../common/rbac/permission.guard';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [forwardRef(() => AuditLogsModule)],
  controllers: [RbacController],
  providers: [RbacService, RbacRepository, RolesGuard, PermissionGuard],
  exports: [RbacService, RolesGuard, PermissionGuard],
})
export class RbacModule {}
