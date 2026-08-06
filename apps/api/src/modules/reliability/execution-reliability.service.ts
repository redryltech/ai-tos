import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionProgress } from '../parallel-executor/models/execution.models';
import {
  RELIABILITY_CONTROLLER,
  type IExecutionReliabilityService,
  type IReliabilityController,
} from './contracts';
import { RELIABILITY_EVENTS } from './events/reliability.events';
import type { ExecutionRecoveryState } from './models/reliability.models';

/**
 * Execution Reliability Engine public API (Layer 5.4).
 * Sole method: handle(executionProgress) → ExecutionRecoveryState.
 * Owns reliability only — never executes, streams, or finalizes.
 */
@Injectable()
export class ExecutionReliabilityService
  implements IExecutionReliabilityService
{
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(RELIABILITY_CONTROLLER)
    private readonly controller: IReliabilityController,
  ) {}

  async handle(
    executionProgress: ExecutionProgress,
  ): Promise<ExecutionRecoveryState> {
    if (!this.config.reliability.enabled) {
      throw new Error('ExecutionReliabilityEngine is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    const workflowId = executionProgress?.workflowId;
    const traceId = executionProgress?.traceId;

    try {
      await this.emit(
        RELIABILITY_EVENTS.started,
        {
          workflowId,
          traceId,
          failedTasks: executionProgress?.failedTasks,
        },
        { id: workflowId },
      );
      this.logger.info('reliability.started', { workflowId });

      const result = await this.controller.handle(executionProgress);

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'reliability',
        status: 'completed',
      });

      await this.emit(
        RELIABILITY_EVENTS.completed,
        {
          workflowId,
          recoveryStatus: result.recoveryStatus,
          retryCount: result.retryCount,
          circuitState: result.circuitState,
          durationMs,
        },
        { id: workflowId },
      );
      this.logger.info('reliability.completed', {
        workflowId,
        recoveryStatus: result.recoveryStatus,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'reliability' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'reliability',
        status: 'failed',
      });
      await this.emit(
        RELIABILITY_EVENTS.failed,
        { workflowId, traceId, error: message },
        { id: workflowId },
      );
      this.logger.error('reliability.failed', { workflowId, error: message });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string },
  ): Promise<void> {
    if (!this.config.reliability.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      source: 'execution-reliability',
    });
  }
}
