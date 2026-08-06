import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigService } from '../configuration/config.service';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  EPISODIC_MEMORY,
  LONG_TERM_MEMORY,
  MEMORY_CONTROLLER,
  MEMORY_EVALUATOR,
  MEMORY_PROVIDER,
  MEMORY_SERVICE,
  SESSION_MEMORY,
} from './contracts';
import { MemoryService } from './memory.service';
import { EpisodicMemory } from './processors/episodic.memory';
import { LongTermMemory } from './processors/long-term.memory';
import { MemoryController } from './processors/memory.controller';
import { MemoryEvaluator } from './processors/memory.evaluator';
import { SessionMemory } from './processors/session.memory';
import { InMemoryMemoryProvider } from './providers/in-memory.memory.provider';

/**
 * Memory Service (Layer 4.1).
 * Public API: MEMORY_SERVICE → IMemoryService
 */
@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    MetricsModule,
    EventBusModule,
    HealthModule,
  ],
  providers: [
    {
      provide: MEMORY_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new InMemoryMemoryProvider(config.memory.maxEntries),
    },
    MemoryEvaluator,
    SessionMemory,
    LongTermMemory,
    EpisodicMemory,
    MemoryController,
    MemoryService,
    { provide: MEMORY_EVALUATOR, useExisting: MemoryEvaluator },
    { provide: SESSION_MEMORY, useExisting: SessionMemory },
    { provide: LONG_TERM_MEMORY, useExisting: LongTermMemory },
    { provide: EPISODIC_MEMORY, useExisting: EpisodicMemory },
    { provide: MEMORY_CONTROLLER, useExisting: MemoryController },
    { provide: MEMORY_SERVICE, useExisting: MemoryService },
  ],
  exports: [MEMORY_SERVICE],
})
export class MemoryModule {}
