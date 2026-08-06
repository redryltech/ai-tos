import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import { createBuiltinToolAdapters } from './adapters';
import {
  TOOL_ADAPTERS,
  TOOL_CONTROLLER,
  TOOL_EXECUTOR,
  TOOL_REGISTRY,
  TOOL_RESOLVER,
  TOOL_SERVICE,
} from './contracts';
import { ToolController } from './processors/tool.controller';
import { ToolExecutor } from './processors/tool.executor';
import { ToolRegistry } from './processors/tool.registry';
import { ToolResolver } from './processors/tool.resolver';
import { ToolService } from './tool.service';

/**
 * Tool Service (Layer 4.5).
 * Public API: TOOL_SERVICE → IToolService.execute()
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
    { provide: TOOL_ADAPTERS, useFactory: () => createBuiltinToolAdapters() },
    ToolRegistry,
    ToolResolver,
    ToolExecutor,
    ToolController,
    ToolService,
    { provide: TOOL_REGISTRY, useExisting: ToolRegistry },
    { provide: TOOL_RESOLVER, useExisting: ToolResolver },
    { provide: TOOL_EXECUTOR, useExisting: ToolExecutor },
    { provide: TOOL_CONTROLLER, useExisting: ToolController },
    { provide: TOOL_SERVICE, useExisting: ToolService },
  ],
  exports: [TOOL_SERVICE],
})
export class ToolModule {}
