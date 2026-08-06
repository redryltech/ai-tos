import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionBlueprint } from '../planning/models/execution-blueprint.models';
import {
  CAPABILITY_RESOLVER,
  EXECUTION_CONTRACT_BUILDER,
  INTENT_CONSOLIDATOR,
  TRANSITION_VALIDATOR,
  type ICapabilityResolver,
  type IExecutionContractBuilder,
  type IIntentConsolidator,
  type IOutputService,
  type ITransitionValidator,
} from './contracts';
import type { BuildOutputInputDto } from './dto/build-output-input.dto';
import { OUTPUT_EVENTS } from './events/output.events';
import type { ExecutionIntent } from './models/execution-intent.models';

function isBlueprint(
  input: ExecutionBlueprint | BuildOutputInputDto,
): input is ExecutionBlueprint {
  return (
    input != null &&
    typeof input === 'object' &&
    'strategy' in input &&
    'tasks' in input &&
    'dependencyGraph' in input &&
    !('blueprint' in input)
  );
}

/**
 * Output Engine public API (Layer 3.5).
 * Sole public method: buildOutput(executionBlueprint) → ExecutionIntent.
 * Never executes, decides, reasons, plans, schedules, allocates, or calls workers/providers.
 */
@Injectable()
export class OutputService implements IOutputService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(INTENT_CONSOLIDATOR) private readonly intentConsolidator: IIntentConsolidator,
    @Inject(CAPABILITY_RESOLVER) private readonly capabilityResolver: ICapabilityResolver,
    @Inject(EXECUTION_CONTRACT_BUILDER)
    private readonly contractBuilder: IExecutionContractBuilder,
    @Inject(TRANSITION_VALIDATOR) private readonly transitionValidator: ITransitionValidator,
  ) {}

  async buildOutput(
    input: ExecutionBlueprint | BuildOutputInputDto,
  ): Promise<ExecutionIntent> {
    if (!this.config.output.enabled) {
      throw new Error('OutputEngine is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();

    const dto: BuildOutputInputDto = isBlueprint(input) ? { blueprint: input } : input;
    const blueprint = dto.blueprint;
    const requestId: string | undefined = blueprint?.requestId;

    try {
      if (!blueprint) {
        throw new Error('ExecutionBlueprint is required');
      }

      await this.emit(
        OUTPUT_EVENTS.started,
        { requestId: blueprint.requestId, goal: blueprint.goal },
        blueprint,
      );

      this.logger.info('output.started', {
        requestId: blueprint.requestId,
        organizationId: blueprint.organizationId,
        userId: blueprint.userId,
      });

      const context = this.intentConsolidator.consolidate(blueprint, dto);
      const capabilities = this.capabilityResolver.resolve(context, dto);
      const draft = this.contractBuilder.build(context, capabilities, dto);
      const intent = this.transitionValidator.validate(draft);

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'output',
        status: 'completed',
      });

      await this.emit(
        OUTPUT_EVENTS.completed,
        {
          requestId: intent.requestId,
          traceId: intent.traceId,
          capabilityCount: intent.metadata.capabilityCount,
          taskCount: intent.metadata.taskCount,
          durationMs,
        },
        intent,
      );

      this.logger.info('output.completed', {
        requestId: intent.requestId,
        organizationId: intent.organizationId,
        userId: intent.userId,
      });

      return intent;
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'output' });
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'output',
        status: 'failed',
      });

      await this.emit(
        OUTPUT_EVENTS.failed,
        { requestId, error: message, durationMs },
        {
          requestId,
          organizationId: blueprint?.organizationId,
          userId: blueprint?.userId,
        },
      );

      this.logger.error('output.failed', {
        requestId,
        organizationId: blueprint?.organizationId,
        userId: blueprint?.userId,
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
    if (!this.config.output.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.requestId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'output-engine',
    });
  }
}
