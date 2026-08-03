import { Global, Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { MetricsService } from './metrics.service';

/**
 * Global MetricsModule (Phase 2.1.4).
 * Injectable MetricsService for Kernel, Cognitive, AI, Execution, and Workers.
 */
@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
