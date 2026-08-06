import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { WorldUnderstanding } from '../perception/models/world-understanding.models';
import {
  CONTEXT_BUILDER,
  CRITICAL_EVALUATOR,
  KNOWLEDGE_SYNTHESIZER,
  REASONING_CORE,
  THOUGHT_COMPOSER,
  type IContextBuilder,
  type ICriticalEvaluator,
  type IKnowledgeSynthesizer,
  type IReasoningCore,
  type IThinkingService,
  type IThoughtComposer,
} from './contracts';
import type { ThinkInputDto } from './dto/think-input.dto';
import { THINKING_EVENTS } from './events/thinking.events';
import type { Thought } from './models/thought.models';

function isWorldUnderstanding(
  input: WorldUnderstanding | ThinkInputDto,
): input is WorldUnderstanding {
  return (
    input != null &&
    typeof input === 'object' &&
    'metadata' in input &&
    'objects' in input &&
    !('world' in input)
  );
}

/**
 * Thinking Engine public API (Layer 3.2).
 * Sole public method: think(worldUnderstanding) → Thought.
 * Never decides, plans, executes, allocates, schedules, or calls workers/providers.
 */
@Injectable()
export class ThinkingService implements IThinkingService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(CONTEXT_BUILDER) private readonly contextBuilder: IContextBuilder,
    @Inject(KNOWLEDGE_SYNTHESIZER)
    private readonly knowledgeSynthesizer: IKnowledgeSynthesizer,
    @Inject(REASONING_CORE) private readonly reasoningCore: IReasoningCore,
    @Inject(CRITICAL_EVALUATOR) private readonly criticalEvaluator: ICriticalEvaluator,
    @Inject(THOUGHT_COMPOSER) private readonly thoughtComposer: IThoughtComposer,
  ) {}

  async think(input: WorldUnderstanding | ThinkInputDto): Promise<Thought> {
    if (!this.config.thinking.enabled) {
      throw new Error('ThinkingEngine is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();

    const dto: ThinkInputDto = isWorldUnderstanding(input) ? { world: input } : input;
    const world = dto.world;
    let requestId: string | undefined = world?.requestId;

    try {
      if (!world) {
        throw new Error('WorldUnderstanding is required');
      }

      const thinkingContext = this.contextBuilder.build(world);
      requestId = thinkingContext.requestId;

      await this.emit(
        THINKING_EVENTS.started,
        { requestId: thinkingContext.requestId, goal: thinkingContext.goal },
        thinkingContext,
      );

      this.logger.info('thinking.started', {
        requestId: thinkingContext.requestId,
        organizationId: thinkingContext.organizationId,
        userId: thinkingContext.userId,
      });

      const knowledge = this.knowledgeSynthesizer.synthesize(thinkingContext, dto);
      const reasoning = this.reasoningCore.reason(thinkingContext, knowledge);
      const evaluated = this.criticalEvaluator.evaluate(
        thinkingContext,
        knowledge,
        reasoning,
      );
      const thought = this.thoughtComposer.compose(thinkingContext, knowledge, evaluated);

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'thinking',
        status: 'completed',
      });

      await this.emit(
        THINKING_EVENTS.completed,
        {
          requestId: thought.requestId,
          confidence: thought.confidence,
          candidateCount: thought.candidateSolutions.length,
          durationMs,
        },
        thought,
      );

      this.logger.info('thinking.completed', {
        requestId: thought.requestId,
        organizationId: thought.organizationId,
        userId: thought.userId,
      });

      return thought;
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'thinking' });
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'thinking',
        status: 'failed',
      });

      await this.emit(
        THINKING_EVENTS.failed,
        { requestId, error: message, durationMs },
        {
          requestId,
          organizationId: world?.organizationId,
          userId: world?.userId,
        },
      );

      this.logger.error('thinking.failed', {
        requestId,
        organizationId: world?.organizationId,
        userId: world?.userId,
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
    if (!this.config.thinking.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.requestId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'thinking-engine',
    });
  }
}
