import { Module } from '@nestjs/common';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { SecretsModule } from './modules/secrets/secrets.module';
import { LoggingModule } from './modules/logging/logging.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { HealthModule } from './modules/health/health.module';
import { CacheModule } from './modules/cache/cache.module';
import { EventBusModule } from './modules/event-bus/event-bus.module';
import { KernelModule } from './modules/kernel/kernel.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CognitiveAdjacentModule } from './boundaries/cognitive-adjacent.module';
import { CapabilityModule } from './modules/capability/capability.module';
import { ModelModule } from './modules/model/model.module';
import { ToolModule } from './modules/tool/tool.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { PolicyModule } from './modules/policy/policy.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { TaskManagerModule } from './modules/task-manager/task-manager.module';
import { ParallelExecutorModule } from './modules/parallel-executor/parallel-executor.module';
import { ReliabilityModule } from './modules/reliability/reliability.module';
import { StreamingModule } from './modules/streaming/streaming.module';
import { FinalizerModule } from './modules/finalizer/finalizer.module';

@Module({
  imports: [
    ConfigurationModule,
    SecretsModule,
    LoggingModule,
    MetricsModule,
    HealthModule,
    CacheModule,
    EventBusModule,
    KernelModule,
    AuthModule,
    OrganizationsModule,
    RbacModule,
    ProfilesModule,
    ApiKeysModule,
    SessionsModule,
    AuditLogsModule,
    /** Product/ATI-adjacent cognitive modules — not SA Platform ownership. */
    CognitiveAdjacentModule,
    CapabilityModule,
    ModelModule,
    ToolModule,
    IntegrationModule,
    PolicyModule,
    WorkflowModule,
    TaskManagerModule,
    ParallelExecutorModule,
    ReliabilityModule,
    StreamingModule,
    FinalizerModule,
  ],
})
export class AppModule {}