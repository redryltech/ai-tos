import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  MEMORY_CONTROLLER,
  type IMemoryController,
  type IMemoryService,
} from './contracts';
import type {
  MemoryQueryDto,
  RememberMemoryDto,
  UpdateMemoryDto,
} from './dto/memory.dto';
import { MEMORY_EVENTS } from './events/memory.events';
import type { MemoryCollection, MemoryRecord } from './models/memory.models';

/**
 * Memory Service public API (Layer 4.1).
 * Preserves experiences across time. Never cognizes, reasons, or executes models.
 */
@Injectable()
export class MemoryService implements IMemoryService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(MEMORY_CONTROLLER) private readonly controller: IMemoryController,
  ) {}

  async remember(memory: RememberMemoryDto): Promise<MemoryRecord> {
    return this.run('remember', memory, async () => {
      const recorded = await this.controller.remember(memory);
      if (!recorded) {
        throw new Error('Memory discarded by evaluator');
      }
      await this.emit(MEMORY_EVENTS.remembered, {
        memoryId: recorded.id,
        kind: recorded.kind,
      }, recorded);
      return recorded;
    });
  }

  async recall(query: MemoryQueryDto): Promise<MemoryCollection> {
    return this.run('recall', query ?? {}, async () => this.controller.recall(query ?? {}));
  }

  async update(memory: UpdateMemoryDto): Promise<MemoryRecord> {
    return this.run('update', { memoryId: memory.id }, async () => {
      const updated = await this.controller.update(memory);
      await this.emit(MEMORY_EVENTS.updated, { memoryId: updated.id }, updated);
      return updated;
    });
  }

  async forget(memoryId: string): Promise<void> {
    return this.run('forget', { memoryId }, async () => {
      await this.controller.forget(memoryId);
      await this.emit(
        MEMORY_EVENTS.forgotten,
        { memoryId },
        { requestId: memoryId },
      );
    });
  }

  async archive(memoryId: string): Promise<void> {
    return this.run('archive', { memoryId }, async () => {
      await this.controller.archive(memoryId);
      await this.emit(
        MEMORY_EVENTS.archived,
        { memoryId },
        { requestId: memoryId },
      );
    });
  }

  async search(query: MemoryQueryDto): Promise<MemoryCollection> {
    return this.run('search', query, async () => this.controller.search(query ?? {}));
  }

  private async run<T>(
    operation: string,
    ctx: { userId?: string; organizationId?: string; memoryId?: string },
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.config.memory.enabled) {
      throw new Error('MemoryService is disabled');
    }
    const startedAt = Date.now();
    this.health.getLiveness();

    try {
      const result = await fn();
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'memory',
        operation,
        status: 'completed',
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'memory', operation });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'memory',
        operation,
        status: 'failed',
      });
      await this.emit(
        MEMORY_EVENTS.failed,
        { operation, error: message, memoryId: ctx.memoryId },
        ctx,
      );
      this.logger.error('memory.failed', {
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        error: message,
      });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { requestId?: string; organizationId?: string; userId?: string; id?: string },
  ): Promise<void> {
    if (!this.config.memory.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.requestId ?? ctx.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'memory-service',
    });
  }
}
