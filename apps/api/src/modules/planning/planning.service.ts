import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import type { Decision } from '../decision/models/decision.models';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  DEPENDENCY_DESIGNER,
  EXECUTION_BLUEPRINT_BUILDER,
  STRATEGY_DESIGNER,
  TASK_DECOMPOSER,
  type IDependencyDesigner,
  type IExecutionBlueprintBuilder,
  type IPlanningService,
  type IStrategyDesigner,
  type ITaskDecomposer,
} from './contracts';
import type { PlanInputDto } from './dto/plan-input.dto';
import { PLANNING_EVENTS } from './events/planning.events';
import type { ExecutionBlueprint } from './models/execution-blueprint.models';

function isDecision(input: Decision | PlanInputDto): input is Decision {
  return (
    input != null &&
    typeof input === 'object' &&
    'selectedAction' in input &&
    'commitmentLevel' in input &&
    !('decision' in input)
  );
}

/**
 * Planning Engine public API (Layer 3.4).
 * Sole public method: plan(decision) → ExecutionBlueprint.
 * Never executes, schedules, allocates, decides, reasons, or calls workers/providers.
 */
@Injectable()
export class PlanningService implements IPlanningService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(STRATEGY_DESIGNER) private readonly strategyDesigner: IStrategyDesigner,
    @Inject(TASK_DECOMPOSER) private readonly taskDecomposer: ITaskDecomposer,
    @Inject(DEPENDENCY_DESIGNER) private readonly dependencyDesigner: IDependencyDesigner,
    @Inject(EXECUTION_BLUEPRINT_BUILDER)
    private readonly blueprintBuilder: IExecutionBlueprintBuilder,
  ) {}

  async plan(input: Decision | PlanInputDto): Promise<ExecutionBlueprint> {
    if (!this.config.planning.enabled) {
      throw new Error('PlanningEngine is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();

    const dto: PlanInputDto = isDecision(input) ? { decision: input } : input;
    const decision = dto.decision;
    const requestId: string | undefined = decision?.requestId;

    try {
      if (!decision) {
        throw new Error('Decision is required');
      }

      await this.emit(
        PLANNING_EVENTS.started,
        { requestId: decision.requestId, goal: decision.goal },
        decision,
      );

      this.logger.info('planning.started', {
        requestId: decision.requestId,
        organizationId: decision.organizationId,
        userId: decision.userId,
      });

      const strategy = this.strategyDesigner.design(decision, dto);
      const taskPlan = this.taskDecomposer.decompose(strategy, dto);
      const dependencyGraph = this.dependencyDesigner.design(strategy, taskPlan);
      const blueprint = this.blueprintBuilder.build(
        decision,
        strategy,
        taskPlan,
        dependencyGraph,
      );

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'planning',
        status: 'completed',
      });

      await this.emit(
        PLANNING_EVENTS.completed,
        {
          requestId: blueprint.requestId,
          strategyId: blueprint.strategy.strategyId,
          taskCount: blueprint.metadata.taskCount,
          edgeCount: blueprint.metadata.edgeCount,
          durationMs,
        },
        blueprint,
      );

      this.logger.info('planning.completed', {
        requestId: blueprint.requestId,
        organizationId: blueprint.organizationId,
        userId: blueprint.userId,
      });

      return blueprint;
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'planning' });
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'planning',
        status: 'failed',
      });

      await this.emit(
        PLANNING_EVENTS.failed,
        { requestId, error: message, durationMs },
        {
          requestId,
          organizationId: decision?.organizationId,
          userId: decision?.userId,
        },
      );

      this.logger.error('planning.failed', {
        requestId,
        organizationId: decision?.organizationId,
        userId: decision?.userId,
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
    if (!this.config.planning.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.requestId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'planning-engine',
    });
  }
}
