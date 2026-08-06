import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { IConnectorAdapter } from './adapters/connector.adapter';
import {
  CONNECTION_LIFECYCLE_MANAGER,
  CONNECTOR_ADAPTERS,
  INTEGRATION_CONTROLLER,
  INTEGRATION_REGISTRY,
  type IConnectionLifecycleManager,
  type IIntegrationController,
  type IIntegrationRegistry,
  type IIntegrationService,
} from './contracts';
import type { IntegrationRequestDto } from './dto/integration.dto';
import { INTEGRATION_EVENTS } from './events/integration.events';
import type { IntegrationResult } from './models/integration.models';

/**
 * Integration Service public API (Layer 4.6).
 * Sole method: execute(request) → IntegrationResult.
 */
@Injectable()
export class IntegrationService implements IIntegrationService, OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(INTEGRATION_CONTROLLER)
    private readonly controller: IIntegrationController,
    @Inject(INTEGRATION_REGISTRY) private readonly registry: IIntegrationRegistry,
    @Inject(CONNECTION_LIFECYCLE_MANAGER)
    private readonly lifecycle: IConnectionLifecycleManager,
    @Inject(CONNECTOR_ADAPTERS) private readonly adapters: IConnectorAdapter[],
  ) {}

  onModuleInit(): void {
    for (const adapter of this.adapters) {
      const descriptor = adapter.descriptor();
      this.registry.register({
        descriptor,
        adapterId: adapter.adapterId,
        available: true,
      });
      void this.emit(
        INTEGRATION_EVENTS.connectorRegistered,
        {
          connectorId: adapter.connectorId,
          adapterId: adapter.adapterId,
          version: descriptor.version,
        },
        {},
      );
    }
  }

  async execute(request: IntegrationRequestDto): Promise<IntegrationResult> {
    if (!this.config.integration.enabled) {
      throw new Error('IntegrationService is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    let requestId: string | undefined = request?.requestId;
    let traceId: string | undefined = request?.traceId;
    let connectorId: string | undefined = request?.connectorId;
    const sessionBefore = connectorId
      ? this.lifecycle.getSession(connectorId)
      : undefined;

    try {
      await this.emit(
        INTEGRATION_EVENTS.started,
        { requestId, connectorId, operation: request?.operation },
        {},
      );
      this.logger.info('integration.started', { requestId, connectorId });

      const result = await this.controller.execute(request);
      requestId = result.requestId;
      traceId = result.traceId;
      connectorId = result.connectorId;

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'integration',
        connector: String(result.connectorId),
        status: result.status,
      });

      const sessionAfter = this.lifecycle.getSession(result.connectorId);
      if (sessionAfter?.state === 'connected') {
        await this.emit(
          INTEGRATION_EVENTS.connectorConnected,
          { connectorId: result.connectorId, sessionId: sessionAfter.sessionId },
          { id: requestId },
        );
        if (sessionBefore?.state === 'error') {
          await this.emit(
            INTEGRATION_EVENTS.connectorRecovered,
            { connectorId: result.connectorId },
            { id: requestId },
          );
        }
      }

      if (result.status === 'completed') {
        await this.emit(
          INTEGRATION_EVENTS.completed,
          {
            requestId,
            connectorId,
            durationMs,
            status: result.status,
          },
          { id: requestId },
        );
        this.logger.info('integration.completed', { requestId, connectorId });
      } else {
        if (result.status === 'auth_failed') {
          await this.emit(
            INTEGRATION_EVENTS.connectorAuthenticationFailed,
            { connectorId, error: result.output.error },
            { id: requestId },
          );
        }
        await this.emit(
          INTEGRATION_EVENTS.failed,
          {
            requestId,
            connectorId,
            durationMs,
            status: result.status,
          },
          { id: requestId },
        );
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'integration' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'integration',
        status: 'failed',
      });
      await this.emit(
        INTEGRATION_EVENTS.failed,
        { requestId, traceId, connectorId, error: message },
        { id: requestId },
      );
      this.logger.error('integration.failed', {
        requestId,
        connectorId,
        error: message,
      });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string; organizationId?: string; userId?: string },
  ): Promise<void> {
    if (!this.config.integration.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'integration-service',
    });
  }
}
