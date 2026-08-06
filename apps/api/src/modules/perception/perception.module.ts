import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  INPUT_GATEWAY,
  OUTPUT_STANDARDIZER,
  PERCEPTION_PROCESSOR,
  PERCEPTION_SERVICE,
  UNDERSTANDING_PROCESSOR,
  WORLD_MODEL_BUILDER,
} from './contracts';
import { PerceptionService } from './perception.service';
import { InputGateway } from './processors/input.gateway';
import { OutputStandardizer } from './processors/output.standardizer';
import { PerceptionProcessor } from './processors/perception.processor';
import { UnderstandingProcessor } from './processors/understanding.processor';
import { WorldModelBuilder } from './processors/world-model.builder';

/**
 * Perception Engine (Layer 3.1).
 * Public API: PERCEPTION_SERVICE → IPerceptionService.perceive()
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
    InputGateway,
    PerceptionProcessor,
    UnderstandingProcessor,
    WorldModelBuilder,
    OutputStandardizer,
    PerceptionService,
    { provide: INPUT_GATEWAY, useExisting: InputGateway },
    { provide: PERCEPTION_PROCESSOR, useExisting: PerceptionProcessor },
    { provide: UNDERSTANDING_PROCESSOR, useExisting: UnderstandingProcessor },
    { provide: WORLD_MODEL_BUILDER, useExisting: WorldModelBuilder },
    { provide: OUTPUT_STANDARDIZER, useExisting: OutputStandardizer },
    { provide: PERCEPTION_SERVICE, useExisting: PerceptionService },
  ],
  exports: [PERCEPTION_SERVICE],
})
export class PerceptionModule {}
