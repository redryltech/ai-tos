import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutableWorkflow } from '../workflow/models/workflow.models';
import {
  TASK_CONTROLLER,
  type ITaskController,
  type ITaskManagerService,
} from './contracts';
import { TASK_EVENTS } from './events/task.events';
import type { ExecutableTaskCollection } from './models/task.models';

/**
 * Task Manager public API (Layer 5.2).
 * Sole method: createTasks(executableWorkflow) → ExecutableTaskCollection.
 * Owns task lifecycle until dispatch preparation — never executes tasks.
 */
@Injectable()
export class TaskManagerService implements ITaskManagerService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(TASK_CONTROLLER) private readonly controller: ITaskController,
  ) {}

  async createTasks(
    executableWorkflow: ExecutableWorkflow,
  ): Promise<ExecutableTaskCollection> {
    if (!this.config.task.enabled) {
      throw new Error('TaskManager is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    const workflowId = executableWorkflow?.id;
    const traceId = executableWorkflow?.traceId;

    try {
      await this.emit(
        TASK_EVENTS.started,
        { workflowId, traceId, taskCount: executableWorkflow?.tasks?.length },
        { id: workflowId },
      );
      this.logger.info('task.started', { workflowId });

      const result = await this.controller.createTasks(executableWorkflow);

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'task-manager',
        status: 'completed',
      });

      await this.emit(
        TASK_EVENTS.completed,
        {
          workflowId,
          taskCount: result.metadata.taskCount,
          readyCount: result.metadata.readyCount,
          dispatchPrepared: result.metadata.dispatchPrepared,
          durationMs,
        },
        { id: workflowId },
      );
      this.logger.info('task.completed', {
        workflowId,
        taskCount: result.metadata.taskCount,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'task-manager' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'task-manager',
        status: 'failed',
      });
      await this.emit(
        TASK_EVENTS.failed,
        { workflowId, traceId, error: message },
        { id: workflowId },
      );
      this.logger.error('task.failed', { workflowId, error: message });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string },
  ): Promise<void> {
    if (!this.config.task.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      source: 'task-manager',
    });
  }
}
