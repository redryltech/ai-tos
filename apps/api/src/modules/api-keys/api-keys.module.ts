import { Module } from '@nestjs/common';
import { RbacModule } from '../rbac/rbac.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysRepository } from './api-keys.repository';
import { ApiKeysService } from './api-keys.service';

@Module({
  imports: [RbacModule, AuditLogsModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeysRepository],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
