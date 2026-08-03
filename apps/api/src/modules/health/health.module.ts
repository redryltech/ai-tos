import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * HealthModule (Phase 2.1.5) — enterprise health + K8s readiness/liveness.
 */
@Module({
  imports: [ConfigurationModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
