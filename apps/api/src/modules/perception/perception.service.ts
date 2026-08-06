import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  INPUT_GATEWAY,
  OUTPUT_STANDARDIZER,
  PERCEPTION_PROCESSOR,
  UNDERSTANDING_PROCESSOR,
  WORLD_MODEL_BUILDER,
  type IInputGateway,
  type IOutputStandardizer,
  type IPerceptionProcessor,
  type IPerceptionService,
  type IUnderstandingProcessor,
  type IWorldModelBuilder,
} from './contracts';
import type { PerceiveInputDto } from './dto/perceive-input.dto';
import { PERCEPTION_EVENTS } from './events/perception.events';
import type { WorldUnderstanding } from './models/world-understanding.models';

/**
 * Perception Engine public API (Layer 3.1).
 * Sole public method: perceive(input) → WorldUnderstanding.
 * Never thinks, decides, plans, executes, retrieves memory, or calls AI/workers.
 */
@Injectable()
export class PerceptionService implements IPerceptionService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(INPUT_GATEWAY) private readonly inputGateway: IInputGateway,
    @Inject(PERCEPTION_PROCESSOR) private readonly perceptionProcessor: IPerceptionProcessor,
    @Inject(UNDERSTANDING_PROCESSOR)
    private readonly understandingProcessor: IUnderstandingProcessor,
    @Inject(WORLD_MODEL_BUILDER) private readonly worldModelBuilder: IWorldModelBuilder,
    @Inject(OUTPUT_STANDARDIZER) private readonly outputStandardizer: IOutputStandardizer,
  ) {}

  async perceive(input: PerceiveInputDto): Promise<WorldUnderstanding> {
    if (!this.config.perception.enabled) {
      throw new Error('PerceptionEngine is disabled');
    }

    const startedAt = Date.now();
    // Ensure Foundation HealthService is reachable (dependency use; no new health APIs).
    this.health.getLiveness();

    let requestId: string | undefined;
    try {
      const normalized = this.inputGateway.accept(input);
      requestId = normalized.requestId;

      await this.emit(PERCEPTION_EVENTS.started, {
        requestId: normalized.requestId,
        inputType: normalized.inputType,
      }, normalized);

      this.logger.info('perception.started', {
        requestId: normalized.requestId,
        organizationId: normalized.organizationId,
        userId: normalized.userId,
      });

      const observations = this.perceptionProcessor.process(normalized);
      const understanding = this.understandingProcessor.process(normalized, observations);
      const world = this.worldModelBuilder.build(normalized, observations, understanding);
      const standardized = this.outputStandardizer.standardize(world);

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'perception',
        input_type: standardized.metadata.inputType,
        status: 'completed',
      });

      await this.emit(
        PERCEPTION_EVENTS.completed,
        {
          requestId: standardized.requestId,
          inputType: standardized.metadata.inputType,
          confidence: standardized.confidence,
          durationMs,
        },
        standardized,
      );

      this.logger.info('perception.completed', {
        requestId: standardized.requestId,
        organizationId: standardized.organizationId,
        userId: standardized.userId,
      });

      return standardized;
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'perception' });
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'perception',
        status: 'failed',
      });

      await this.emit(PERCEPTION_EVENTS.failed, {
        requestId,
        error: message,
        durationMs,
      }, {
        requestId,
        organizationId: input?.organizationId,
        userId: input?.userId,
      });

      this.logger.error('perception.failed', {
        requestId,
        organizationId: input?.organizationId,
        userId: input?.userId,
        error: message,
      });

      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { requestId?: string; organizationId?: string; userId?: string },
  ): Promise<void> {
    if (!this.config.perception.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.requestId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'perception-engine',
    });
  }
}
