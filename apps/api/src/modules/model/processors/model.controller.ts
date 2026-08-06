import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import type { IProviderAdapter } from '../adapters/provider.adapter';
import {
  AUTHENTICATION_MANAGER,
  INFERENCE_EXECUTOR,
  PROVIDER_ADAPTERS,
  PROVIDER_HEALTH_MONITOR,
  PROVIDER_REGISTRY,
  USAGE_COLLECTOR,
  type IAuthenticationManager,
  type IInferenceExecutor,
  type IModelController,
  type IProviderHealthMonitor,
  type IProviderRegistry,
  type IUsageCollector,
} from '../contracts';
import type { ModelRequestDto } from '../dto/model.dto';
import type { ModelRequest, ModelResponse } from '../models/model.models';

/**
 * Model Controller — validate request and start execution pipeline.
 * Never performs inference itself.
 */
@Injectable()
export class ModelController implements IModelController {
  private readonly adaptersByProvider: Map<string, IProviderAdapter>;

  constructor(
    private readonly config: ConfigService,
    @Inject(PROVIDER_REGISTRY) private readonly registry: IProviderRegistry,
    @Inject(AUTHENTICATION_MANAGER)
    private readonly auth: IAuthenticationManager,
    @Inject(INFERENCE_EXECUTOR) private readonly executor: IInferenceExecutor,
    @Inject(PROVIDER_HEALTH_MONITOR)
    private readonly health: IProviderHealthMonitor,
    @Inject(USAGE_COLLECTOR) private readonly usage: IUsageCollector,
    @Inject(PROVIDER_ADAPTERS) adapters: IProviderAdapter[],
  ) {
    this.adaptersByProvider = new Map(adapters.map((a) => [a.providerId, a]));
  }

  async infer(dto: ModelRequestDto): Promise<ModelResponse> {
    const request = this.validate(dto);
    const registration = this.registry.get(request.providerId);
    if (!registration || !registration.available) {
      throw new Error(`Provider unavailable: ${request.providerId}`);
    }

    const adapter = this.adaptersByProvider.get(request.providerId);
    if (!adapter) {
      throw new Error(`Provider adapter missing: ${request.providerId}`);
    }

    if (!adapter.supports(request.modelId)) {
      throw new Error(
        `Model ${request.modelId} not supported by provider ${request.providerId}`,
      );
    }

    if (!this.auth.validate(request.providerId)) {
      throw new Error(`Provider authentication invalid: ${request.providerId}`);
    }

    const started = Date.now();
    const previous = this.health.get(request.providerId);
    const response = await this.executor.execute(request, adapter);
    const duration = Date.now() - started;

    if (response.status === 'completed') {
      this.health.recordSuccess(request.providerId, duration);
      if (previous?.status === 'unhealthy') {
        this.health.markRecovered(request.providerId);
      }
    } else {
      this.health.recordFailure(
        request.providerId,
        String(response.output.error ?? response.status),
        duration,
      );
    }

    this.usage.collect({
      requestId: response.requestId,
      providerId: response.providerId,
      modelId: response.modelId,
      usage: response.usage,
      duration: response.duration,
      status: response.status,
      recordedAt: Date.now(),
    });

    return response;
  }

  private validate(dto: ModelRequestDto): ModelRequest {
    if (!dto || typeof dto !== 'object') {
      throw new Error('ModelRequest is required');
    }
    if (!dto.modelId || typeof dto.modelId !== 'string') {
      throw new Error('ModelRequest.modelId is required');
    }
    if (!dto.input || typeof dto.input !== 'object') {
      throw new Error('ModelRequest.input is required');
    }

    const providerId =
      typeof dto.providerId === 'string' && dto.providerId.trim()
        ? dto.providerId.trim()
        : this.config.model.defaultProvider;

    return Object.freeze({
      requestId:
        typeof dto.requestId === 'string' && dto.requestId.trim()
          ? dto.requestId.trim()
          : randomUUID(),
      providerId,
      modelId: dto.modelId.trim(),
      input: Object.freeze({ ...dto.input }),
      options: dto.options
        ? Object.freeze({
            ...dto.options,
            mode: dto.options.mode ?? dto.mode,
          })
        : dto.mode
          ? Object.freeze({ mode: dto.mode })
          : undefined,
      metadata: Object.freeze({ ...(dto.metadata ?? {}) }),
      traceId:
        typeof dto.traceId === 'string' && dto.traceId.trim()
          ? dto.traceId.trim()
          : randomUUID(),
    });
  }
}
