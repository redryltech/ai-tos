import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { RbacModule } from '../rbac/rbac.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [RbacModule, AuditLogsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationsRepository],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
