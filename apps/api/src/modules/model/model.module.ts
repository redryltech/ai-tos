import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import { createBuiltinAdapters } from './adapters';
import {
  AUTHENTICATION_MANAGER,
  INFERENCE_EXECUTOR,
  MODEL_CONTROLLER,
  MODEL_SERVICE,
  PROVIDER_ADAPTERS,
  PROVIDER_HEALTH_MONITOR,
  PROVIDER_REGISTRY,
  USAGE_COLLECTOR,
} from './contracts';
import { ModelService } from './model.service';
import { AuthenticationManager } from './processors/authentication.manager';
import { InferenceExecutor } from './processors/inference.executor';
import { ModelController } from './processors/model.controller';
import { ProviderHealthMonitor } from './processors/provider.health.monitor';
import { ProviderRegistry } from './processors/provider.registry';
import { UsageCollector } from './processors/usage.collector';

/**
 * Model Service (Layer 4.4).
 * Public API: MODEL_SERVICE → IModelService.infer()
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
    { provide: PROVIDER_ADAPTERS, useFactory: () => createBuiltinAdapters() },
    ProviderRegistry,
    AuthenticationManager,
    InferenceExecutor,
    ProviderHealthMonitor,
    UsageCollector,
    ModelController,
    ModelService,
    { provide: PROVIDER_REGISTRY, useExisting: ProviderRegistry },
    { provide: AUTHENTICATION_MANAGER, useExisting: AuthenticationManager },
    { provide: INFERENCE_EXECUTOR, useExisting: InferenceExecutor },
    { provide: PROVIDER_HEALTH_MONITOR, useExisting: ProviderHealthMonitor },
    { provide: USAGE_COLLECTOR, useExisting: UsageCollector },
    { provide: MODEL_CONTROLLER, useExisting: ModelController },
    { provide: MODEL_SERVICE, useExisting: ModelService },
  ],
  exports: [MODEL_SERVICE],
})
export class ModelModule {}
