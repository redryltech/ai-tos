import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import { createBuiltinConnectorAdapters } from './adapters';
import {
  CONNECTION_LIFECYCLE_MANAGER,
  CONNECTOR_ADAPTERS,
  INTEGRATION_CONTROLLER,
  INTEGRATION_REGISTRY,
  INTEGRATION_RESOLVER,
  INTEGRATION_SERVICE,
} from './contracts';
import { IntegrationService } from './integration.service';
import { ConnectionLifecycleManager } from './processors/connection.lifecycle.manager';
import { IntegrationController } from './processors/integration.controller';
import { IntegrationRegistry } from './processors/integration.registry';
import { IntegrationResolver } from './processors/integration.resolver';

/**
 * Integration Service (Layer 4.6).
 * Public API: INTEGRATION_SERVICE → IIntegrationService.execute()
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
      provide: CONNECTOR_ADAPTERS,
      useFactory: () => createBuiltinConnectorAdapters(),
    },
    IntegrationRegistry,
    IntegrationResolver,
    ConnectionLifecycleManager,
    IntegrationController,
    IntegrationService,
    { provide: INTEGRATION_REGISTRY, useExisting: IntegrationRegistry },
    { provide: INTEGRATION_RESOLVER, useExisting: IntegrationResolver },
    {
      provide: CONNECTION_LIFECYCLE_MANAGER,
      useExisting: ConnectionLifecycleManager,
    },
    { provide: INTEGRATION_CONTROLLER, useExisting: IntegrationController },
    { provide: INTEGRATION_SERVICE, useExisting: IntegrationService },
  ],
  exports: [INTEGRATION_SERVICE],
})
export class IntegrationModule {}
