import { Module } from '@nestjs/common';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { SecretsModule } from './modules/secrets/secrets.module';
import { LoggingModule } from './modules/logging/logging.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { HealthModule } from './modules/health/health.module';
import { CacheModule } from './modules/cache/cache.module';
import { EventBusModule } from './modules/event-bus/event-bus.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigurationModule,
    SecretsModule,
    LoggingModule,
    MetricsModule,
    HealthModule,
    CacheModule,
    EventBusModule,
    AuthModule,
    OrganizationsModule,
    RbacModule,
    ProfilesModule,
    ApiKeysModule,
    SessionsModule,
    AuditLogsModule,
  ],
})
export class AppModule {}
