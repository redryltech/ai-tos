import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { IProviderAdapter } from './adapters/provider.adapter';
import {
  MODEL_CONTROLLER,
  PROVIDER_ADAPTERS,
  PROVIDER_HEALTH_MONITOR,
  PROVIDER_REGISTRY,
  AUTHENTICATION_MANAGER,
  type IAuthenticationManager,
  type IModelController,
  type IModelService,
  type IProviderHealthMonitor,
  type IProviderRegistry,
} from './contracts';
import type { ModelRequestDto } from './dto/model.dto';
import { MODEL_EVENTS } from './events/model.events';
import type { ModelResponse } from './models/model.models';

/**
 * Model Service public API (Layer 4.4).
 * Sole method: infer(request) → ModelResponse.
 */
@Injectable()
export class ModelService implements IModelService, OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(MODEL_CONTROLLER) private readonly controller: IModelController,
    @Inject(PROVIDER_REGISTRY) private readonly registry: IProviderRegistry,
    @Inject(AUTHENTICATION_MANAGER)
    private readonly auth: IAuthenticationManager,
    @Inject(PROVIDER_HEALTH_MONITOR)
    private readonly providerHealth: IProviderHealthMonitor,
    @Inject(PROVIDER_ADAPTERS) private readonly adapters: IProviderAdapter[],
  ) {}

  onModuleInit(): void {
    for (const adapter of this.adapters) {
      const descriptor = adapter.descriptor();
      this.registry.register({
        descriptor,
        adapterId: adapter.adapterId,
        available: true,
      });
      this.auth.store({
        providerId: adapter.providerId,
        mode: this.config.model.authMode,
        secretRef: `secret://${adapter.providerId}`,
        expiresAt: Date.now() + 86_400_000,
        metadata: Object.freeze({ bootstrap: true }),
      });
      this.providerHealth.recordSuccess(adapter.providerId, 0);
      void this.emit(
        MODEL_EVENTS.providerRegistered,
        {
          providerId: adapter.providerId,
          kind: descriptor.kind,
          adapterId: adapter.adapterId,
        },
        {},
      );
    }
  }

  async infer(request: ModelRequestDto): Promise<ModelResponse> {
    if (!this.config.model.enabled) {
      throw new Error('ModelService is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    let requestId: string | undefined = request?.requestId;
    let traceId: string | undefined = request?.traceId;
    const providerIdHint =
      typeof request?.providerId === 'string' && request.providerId.trim()
        ? request.providerId.trim()
        : this.config.model.defaultProvider;
    let providerId: string | undefined = providerIdHint;
    const healthBefore = this.providerHealth.get(providerIdHint);

    try {
      await this.emit(
        MODEL_EVENTS.inferenceStarted,
        {
          requestId,
          providerId,
          modelId: request?.modelId,
        },
        {},
      );
      this.logger.info('model.inference.started', { requestId });

      const result = await this.controller.infer(request);
      requestId = result.requestId;
      traceId = result.traceId;
      providerId = result.providerId;

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'model',
        provider: String(result.providerId),
        status: result.status,
      });

      if (result.status === 'completed') {
        await this.emit(
          MODEL_EVENTS.inferenceCompleted,
          {
            requestId,
            providerId,
            modelId: result.modelId,
            durationMs,
            totalTokens: result.usage.totalTokens,
          },
          { id: requestId },
        );
        if (healthBefore?.status === 'unhealthy') {
          await this.emit(
            MODEL_EVENTS.providerRecovered,
            { providerId },
            { id: requestId },
          );
        }
        this.logger.info('model.inference.completed', { requestId });
      } else {
        await this.emit(
          MODEL_EVENTS.inferenceFailed,
          {
            requestId,
            providerId,
            modelId: result.modelId,
            status: result.status,
            durationMs,
          },
          { id: requestId },
        );
        if (this.providerHealth.get(result.providerId)?.status === 'unhealthy') {
          await this.emit(
            MODEL_EVENTS.providerUnhealthy,
            {
              providerId,
              status: 'unhealthy',
            },
            { id: requestId },
          );
        }
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'model' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'model',
        status: 'failed',
      });
      await this.emit(
        MODEL_EVENTS.inferenceFailed,
        { requestId, traceId, providerId, error: message },
        { id: requestId },
      );
      this.logger.error('model.inference.failed', {
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
    if (!this.config.model.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'model-service',
    });
  }
}
