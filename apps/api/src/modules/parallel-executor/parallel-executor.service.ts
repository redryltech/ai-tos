import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutableTaskCollection } from '../task-manager/models/task.models';
import {
  EXECUTION_CONTROLLER,
  type IExecutionController,
  type IParallelExecutorService,
} from './contracts';
import { EXECUTION_EVENTS } from './events/execution.events';
import type { ExecutionProgress } from './models/execution.models';

/**
 * Parallel Executor public API (Layer 5.3).
 * Sole method: execute(executableTaskCollection) → ExecutionProgress.
 * Executes via abstract workers; never retries, recovers, streams, or finalizes.
 */
@Injectable()
export class ParallelExecutorService implements IParallelExecutorService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(EXECUTION_CONTROLLER)
    private readonly controller: IExecutionController,
  ) {}

  async execute(
    executableTaskCollection: ExecutableTaskCollection,
  ): Promise<ExecutionProgress> {
    if (!this.config.execution.enabled) {
      throw new Error('ParallelExecutor is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    const workflowId = executableTaskCollection?.workflowId;
    const traceId =
      executableTaskCollection?.tasks?.[0]?.traceId ?? workflowId;

    try {
      await this.emit(
        EXECUTION_EVENTS.started,
        {
          workflowId,
          traceId,
          taskCount: executableTaskCollection?.tasks?.length,
        },
        { id: workflowId },
      );
      this.logger.info('execution.started', { workflowId });

      const result = await this.controller.execute(executableTaskCollection);

      await this.emit(
        EXECUTION_EVENTS.progress,
        {
          workflowId,
          progressPercentage: result.progressPercentage,
          completedTasks: result.completedTasks,
          failedTasks: result.failedTasks,
        },
        { id: workflowId },
      );

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'parallel-executor',
        status: result.failedTasks > 0 ? 'completed_with_failures' : 'completed',
      });

      await this.emit(
        EXECUTION_EVENTS.completed,
        {
          workflowId,
          progressPercentage: result.progressPercentage,
          completedTasks: result.completedTasks,
          failedTasks: result.failedTasks,
          durationMs,
        },
        { id: workflowId },
      );
      this.logger.info('execution.completed', {
        workflowId,
        progressPercentage: result.progressPercentage,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'parallel-executor' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'parallel-executor',
        status: 'failed',
      });
      await this.emit(
        EXECUTION_EVENTS.failed,
        { workflowId, traceId, error: message },
        { id: workflowId },
      );
      this.logger.error('execution.failed', { workflowId, error: message });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string },
  ): Promise<void> {
    if (!this.config.execution.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      source: 'parallel-executor',
    });
  }
}
