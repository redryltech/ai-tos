import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  FINALIZATION_CONTROLLER,
  type IExecutionFinalizerService,
  type IFinalizationController,
} from './contracts';
import { FINALIZATION_EVENTS } from './events/finalizer.events';
import type {
  CompletedExecution,
  ExecutionResult,
} from './models/finalizer.models';

/**
 * Execution Finalizer public API (Layer 5.6).
 * Sole method: finalize(completedExecution) → ExecutionResult.
 * Owns finalization only — never executes, retries, streams, or manages lifecycle.
 */
@Injectable()
export class ExecutionFinalizerService implements IExecutionFinalizerService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(FINALIZATION_CONTROLLER)
    private readonly controller: IFinalizationController,
  ) {}

  async finalize(
    completedExecution: CompletedExecution,
  ): Promise<ExecutionResult> {
    if (!this.config.finalization.enabled) {
      throw new Error('ExecutionFinalizer is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    const workflowId = completedExecution?.workflowId;
    const traceId = completedExecution?.traceId;

    try {
      await this.emit(
        FINALIZATION_EVENTS.started,
        { workflowId, traceId },
        { id: workflowId },
      );
      this.logger.info('finalization.started', { workflowId });

      const result = await this.controller.finalize(completedExecution);

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'finalizer',
        status: 'completed',
      });

      await this.emit(
        FINALIZATION_EVENTS.completed,
        {
          workflowId,
          status: result.status,
          completedTasks: result.summary.completedTasks,
          failedTasks: result.summary.failedTasks,
          durationMs,
        },
        { id: workflowId },
      );
      this.logger.info('finalization.completed', {
        workflowId,
        status: result.status,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'finalizer' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'finalizer',
        status: 'failed',
      });
      await this.emit(
        FINALIZATION_EVENTS.failed,
        { workflowId, traceId, error: message },
        { id: workflowId },
      );
      this.logger.error('finalization.failed', { workflowId, error: message });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string },
  ): Promise<void> {
    if (!this.config.finalization.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      source: 'execution-finalizer',
    });
  }
}
