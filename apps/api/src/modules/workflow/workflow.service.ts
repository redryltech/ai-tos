import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionIntent } from '../output/models/execution-intent.models';
import {
  WORKFLOW_CONTROLLER,
  type IWorkflowController,
  type IWorkflowService,
} from './contracts';
import { WORKFLOW_EVENTS } from './events/workflow.events';
import type { ExecutableWorkflow } from './models/workflow.models';

/**
 * Workflow Engine public API (Layer 5.1).
 * Sole method: createWorkflow(executionIntent) → ExecutableWorkflow.
 * Compile-time only — never executes, retries, streams, or manages runtime state.
 */
@Injectable()
export class WorkflowService implements IWorkflowService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(WORKFLOW_CONTROLLER) private readonly controller: IWorkflowController,
  ) {}

  async createWorkflow(
    executionIntent: ExecutionIntent,
  ): Promise<ExecutableWorkflow> {
    if (!this.config.workflow.enabled) {
      throw new Error('WorkflowEngine is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    const requestId = executionIntent?.requestId;
    const traceId = executionIntent?.traceId;

    try {
      await this.emit(
        WORKFLOW_EVENTS.started,
        { requestId, traceId, goal: executionIntent?.goal },
        { id: requestId },
      );
      this.logger.info('workflow.started', { requestId });

      const result = await this.controller.createWorkflow(executionIntent);

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'workflow',
        status: 'completed',
      });

      await this.emit(
        WORKFLOW_EVENTS.completed,
        {
          requestId,
          workflowId: result.id,
          nodeCount: result.metadata.nodeCount,
          strategyKind: result.executionStrategy.kind,
          durationMs,
        },
        { id: requestId },
      );
      this.logger.info('workflow.completed', {
        requestId,
        workflowId: result.id,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'workflow' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'workflow',
        status: 'failed',
      });
      await this.emit(
        WORKFLOW_EVENTS.failed,
        { requestId, traceId, error: message },
        { id: requestId },
      );
      this.logger.error('workflow.failed', { requestId, error: message });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string },
  ): Promise<void> {
    if (!this.config.workflow.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      source: 'workflow-engine',
    });
  }
}
