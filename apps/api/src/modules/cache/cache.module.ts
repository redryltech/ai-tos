import { Global, Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { CacheService } from './cache.service';

/**
 * Global CacheModule (Phase 2.1.6).
 * Injectable CacheService for Kernel, Cognitive, AI, Execution, and Workers.
 */
@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
