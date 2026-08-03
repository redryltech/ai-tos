import { Global, Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { LoggerService } from './logger.service';

/**
 * Global LoggingModule (Phase 2.1.3).
 * Injectable LoggerService for Kernel, Cognitive, AI, Execution, and Workers.
 */
@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggingModule {}
