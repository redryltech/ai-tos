import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  CAPABILITY_CONTROLLER,
  CAPABILITY_PROVIDER,
  CAPABILITY_REGISTRY,
  type ICapabilityController,
  type ICapabilityRegistry,
  type ICapabilityService,
} from './contracts';
import type { CapabilityRequestDto } from './dto/capability.dto';
import { CAPABILITY_EVENTS } from './events/capability.events';
import type { CapabilityResult } from './models/capability.models';
import { createBuiltinLocalImplementations } from './processors/builtin.capabilities';
import type { ICapabilityProvider } from './providers/capability.provider';

/**
 * Capability Service public API (Layer 4.3).
 * Sole method: execute(request) → CapabilityResult.
 */
@Injectable()
export class CapabilityService implements ICapabilityService, OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(CAPABILITY_CONTROLLER)
    private readonly controller: ICapabilityController,
    @Inject(CAPABILITY_REGISTRY) private readonly registry: ICapabilityRegistry,
    @Inject(CAPABILITY_PROVIDER) private readonly provider: ICapabilityProvider,
  ) {}

  onModuleInit(): void {
    for (const impl of createBuiltinLocalImplementations(this.provider.providerId)) {
      this.registry.register(impl);
    }
  }

  async execute(request: CapabilityRequestDto): Promise<CapabilityResult> {
    if (!this.config.capability.enabled) {
      throw new Error('CapabilityService is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    let requestId: string | undefined = request?.requestId;
    let traceId: string | undefined = request?.traceId;

    try {
      await this.emit(
        CAPABILITY_EVENTS.started,
        {
          capability: request?.capability,
          requestId,
        },
        {},
      );

      this.logger.info('capability.started', {
        requestId,
      });

      const result = await this.controller.execute(request);
      requestId = result.requestId;
      traceId = result.traceId;

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'capability',
        capability: String(result.capability),
        status: result.status,
      });

      if (result.status === 'cancelled') {
        await this.emit(
          CAPABILITY_EVENTS.cancelled,
          { requestId, capability: result.capability, durationMs },
          { id: requestId },
        );
      } else if (result.status === 'completed') {
        await this.emit(
          CAPABILITY_EVENTS.completed,
          {
            requestId,
            capability: result.capability,
            durationMs,
            status: result.status,
          },
          { id: requestId },
        );
        this.logger.info('capability.completed', { requestId });
      } else {
        await this.emit(
          CAPABILITY_EVENTS.failed,
          {
            requestId,
            capability: result.capability,
            durationMs,
            status: result.status,
          },
          { id: requestId },
        );
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'capability' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'capability',
        status: 'failed',
      });
      await this.emit(
        CAPABILITY_EVENTS.failed,
        { requestId, traceId, error: message },
        { id: requestId },
      );
      this.logger.error('capability.failed', {
        requestId,
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
    if (!this.config.capability.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'capability-service',
    });
  }
}
