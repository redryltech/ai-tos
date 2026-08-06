import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { IToolAdapter } from './adapters/tool.adapter';
import {
  TOOL_ADAPTERS,
  TOOL_CONTROLLER,
  TOOL_REGISTRY,
  type IToolController,
  type IToolRegistry,
  type IToolService,
} from './contracts';
import type { ToolRequestDto } from './dto/tool.dto';
import { TOOL_EVENTS } from './events/tool.events';
import type { ToolResult } from './models/tool.models';

/**
 * Tool Service public API (Layer 4.5).
 * Sole method: execute(request) → ToolResult.
 */
@Injectable()
export class ToolService implements IToolService, OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(TOOL_CONTROLLER) private readonly controller: IToolController,
    @Inject(TOOL_REGISTRY) private readonly registry: IToolRegistry,
    @Inject(TOOL_ADAPTERS) private readonly adapters: IToolAdapter[],
  ) {}

  onModuleInit(): void {
    for (const adapter of this.adapters) {
      const descriptor = adapter.descriptor();
      this.registry.register({
        descriptor,
        adapterId: adapter.adapterId,
        available: true,
      });
      void this.emit(
        TOOL_EVENTS.registered,
        {
          toolId: adapter.toolId,
          adapterId: adapter.adapterId,
          version: descriptor.version,
        },
        {},
      );
    }
  }

  async execute(request: ToolRequestDto): Promise<ToolResult> {
    if (!this.config.tool.enabled) {
      throw new Error('ToolService is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    let requestId: string | undefined = request?.requestId;
    let traceId: string | undefined = request?.traceId;
    let toolId: string | undefined = request?.toolId;

    try {
      await this.emit(
        TOOL_EVENTS.started,
        { requestId, toolId },
        {},
      );
      this.logger.info('tool.started', { requestId, toolId });

      const result = await this.controller.execute(request);
      requestId = result.requestId;
      traceId = result.traceId;
      toolId = result.toolId;

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'tool',
        tool: String(result.toolId),
        status: result.status,
      });

      if (result.status === 'cancelled') {
        await this.emit(
          TOOL_EVENTS.cancelled,
          { requestId, toolId, durationMs },
          { id: requestId },
        );
      } else if (result.status === 'completed') {
        await this.emit(
          TOOL_EVENTS.completed,
          { requestId, toolId, durationMs, status: result.status },
          { id: requestId },
        );
        this.logger.info('tool.completed', { requestId, toolId });
      } else {
        await this.emit(
          TOOL_EVENTS.failed,
          { requestId, toolId, durationMs, status: result.status },
          { id: requestId },
        );
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'tool' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'tool',
        status: 'failed',
      });
      await this.emit(
        TOOL_EVENTS.failed,
        { requestId, traceId, toolId, error: message },
        { id: requestId },
      );
      this.logger.error('tool.failed', { requestId, toolId, error: message });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string; organizationId?: string; userId?: string },
  ): Promise<void> {
    if (!this.config.tool.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'tool-service',
    });
  }
}
