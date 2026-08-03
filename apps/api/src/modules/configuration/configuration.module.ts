import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Global ConfigurationModule (Phase 2.1.1).
 * Validates environment at process start via @ai-tos/config and exposes ConfigService.
 */
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigurationModule {}
