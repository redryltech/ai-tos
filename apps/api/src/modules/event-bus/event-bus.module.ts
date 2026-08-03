import { Global, Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusService } from './event-bus.service';

/**
 * Global EventBusModule (Phase 2.1.7).
 * Injectable EventBusService for Kernel, Cognitive, AI, Execution, and Workers.
 */
@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}
