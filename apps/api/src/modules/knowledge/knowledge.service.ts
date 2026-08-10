import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  KNOWLEDGE_CONTROLLER,
  type IKnowledgeController,
  type IKnowledgeService,
} from './contracts';
import type {
  IngestKnowledgeDto,
  KnowledgeQueryDto,
  UpdateKnowledgeDocumentDto,
} from './dto/knowledge.dto';
import { KNOWLEDGE_EVENTS } from './events/knowledge.events';
import type {
  KnowledgeCollection,
  KnowledgeDocument,
} from './models/knowledge.models';

/**
 * Knowledge Service public API (Layer 4.2).
 * Manages discoverable facts/documents. Never cognizes, embeds, or stores experiences.
 *
 * Boundary: COGNITIVE_PRODUCT_ADJACENT — Knowledge ≠ Platform durable representation (SA-007).
 * Persistence ≠ Truth / Memory / World Model.
 */
@Injectable()
export class KnowledgeService implements IKnowledgeService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(KNOWLEDGE_CONTROLLER)
    private readonly controller: IKnowledgeController,
  ) {}

  async ingest(source: IngestKnowledgeDto): Promise<KnowledgeCollection> {
    return this.run('ingest', source, async () => {
      const collection = await this.controller.ingest(source);
      await this.emit(
        KNOWLEDGE_EVENTS.ingested,
        {
          documentId: collection.items[0]?.id,
          total: collection.total,
        },
        source,
      );
      return collection;
    });
  }

  async retrieve(query: KnowledgeQueryDto): Promise<KnowledgeCollection> {
    return this.run('retrieve', query ?? {}, async () => {
      const collection = await this.controller.retrieve(query ?? {});
      await this.emit(
        KNOWLEDGE_EVENTS.retrieved,
        { total: collection.total, mode: query?.mode },
        query ?? {},
      );
      return collection;
    });
  }

  async search(query: KnowledgeQueryDto): Promise<KnowledgeCollection> {
    return this.run('search', query ?? {}, async () => {
      const collection = await this.controller.search(query ?? {});
      await this.emit(
        KNOWLEDGE_EVENTS.searchCompleted,
        { total: collection.total, mode: query?.mode },
        query ?? {},
      );
      return collection;
    });
  }

  async update(document: UpdateKnowledgeDocumentDto): Promise<KnowledgeDocument> {
    return this.run('update', { userId: undefined, organizationId: undefined }, async () => {
      const updated = await this.controller.update(document);
      await this.emit(
        KNOWLEDGE_EVENTS.updated,
        { documentId: updated.id },
        updated,
      );
      return updated;
    });
  }

  async delete(documentId: string): Promise<void> {
    return this.run('delete', {}, async () => {
      await this.controller.delete(documentId);
      await this.emit(KNOWLEDGE_EVENTS.deleted, { documentId }, {});
    });
  }

  async list(): Promise<KnowledgeCollection> {
    return this.run('list', {}, async () => this.controller.list());
  }

  private async run<T>(
    operation: string,
    ctx: { userId?: string; organizationId?: string },
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.config.knowledge.enabled) {
      throw new Error('KnowledgeService is disabled');
    }
    const startedAt = Date.now();
    this.health.getLiveness();

    try {
      const result = await fn();
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'knowledge',
        operation,
        status: 'completed',
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'knowledge', operation });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'knowledge',
        operation,
        status: 'failed',
      });
      await this.emit(
        KNOWLEDGE_EVENTS.failed,
        { operation, error: message },
        ctx,
      );
      this.logger.error('knowledge.failed', {
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
    ctx: { organizationId?: string; userId?: string; id?: string },
  ): Promise<void> {
    if (!this.config.knowledge.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'knowledge-service',
    });
  }
}
