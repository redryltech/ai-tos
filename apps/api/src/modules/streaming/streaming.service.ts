import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionProgress } from '../parallel-executor/models/execution.models';
import {
  STREAMING_CONTROLLER,
  type IStreamingController,
  type IStreamingService,
} from './contracts';
import { STREAMING_EVENTS } from './events/streaming.events';
import type { ExecutionStream } from './models/streaming.models';

/**
 * Streaming Engine public API (Layer 5.5).
 * Sole method: stream(executionProgress) → ExecutionStream.
 * Owns streaming only — never executes, retries, recovers, or finalizes.
 */
@Injectable()
export class StreamingService implements IStreamingService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(STREAMING_CONTROLLER)
    private readonly controller: IStreamingController,
  ) {}

  async stream(
    executionProgress: ExecutionProgress,
  ): Promise<ExecutionStream> {
    if (!this.config.streaming.enabled) {
      throw new Error('StreamingEngine is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    const workflowId = executionProgress?.workflowId;
    const traceId = executionProgress?.traceId;

    try {
      await this.emit(
        STREAMING_EVENTS.started,
        {
          workflowId,
          traceId,
          progressPercentage: executionProgress?.progressPercentage,
        },
        { id: workflowId },
      );
      this.logger.info('stream.started', { workflowId });

      const result = await this.controller.stream(executionProgress);

      await this.emit(
        STREAMING_EVENTS.progress,
        {
          workflowId,
          streamId: result.streamId,
          progressPercentage: result.progress.progressPercentage,
          eventCount: result.events.length,
        },
        { id: workflowId },
      );

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'streaming',
        status: 'completed',
      });

      await this.emit(
        STREAMING_EVENTS.completed,
        {
          workflowId,
          streamId: result.streamId,
          eventCount: result.events.length,
          outputCount: result.outputs.length,
          durationMs,
        },
        { id: workflowId },
      );
      this.logger.info('stream.completed', {
        workflowId,
        streamId: result.streamId,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'streaming' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'streaming',
        status: 'failed',
      });
      await this.emit(
        STREAMING_EVENTS.failed,
        { workflowId, traceId, error: message },
        { id: workflowId },
      );
      this.logger.error('stream.failed', { workflowId, error: message });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string },
  ): Promise<void> {
    if (!this.config.streaming.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      source: 'streaming-engine',
    });
  }
}
