import { randomUUID } from 'node:crypto';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { assertValidTopic } from './event-routing';
import type {
  AiOsEvent,
  EventBusStats,
  EventBusTransport,
  EventHandler,
  Subscription,
} from './event.types';
import { MemoryEventBusTransport } from './memory-event-bus.transport';

export interface PublishOptions {
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  source?: string;
  version?: string;
  eventId?: string;
}

/**
 * Internal AI OS event bus (Phase 2.1.7).
 * Publish / subscribe / unsubscribe · typed events · async dispatch · topic routing.
 */
@Injectable()
export class EventBusService implements OnModuleDestroy {
  private readonly transport: EventBusTransport;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const cfg = config.eventBus;
    this.enabled = cfg.enabled;
    this.transport = new MemoryEventBusTransport(cfg.maxListenersPerTopic, cfg.dispatch);
  }

  get driver(): string {
    return this.transport.driver;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  async publish<TPayload>(
    topic: string,
    payload: TPayload,
    options: PublishOptions = {},
  ): Promise<AiOsEvent<TPayload>> {
    assertValidTopic(topic);
    const event: AiOsEvent<TPayload> = {
      topic,
      payload,
      eventId: options.eventId ?? randomUUID(),
      correlationId: options.correlationId,
      organizationId: options.organizationId,
      userId: options.userId,
      source: options.source ?? this.config.app.name,
      timestamp: new Date().toISOString(),
      version: options.version ?? '1',
    };

    if (!this.enabled) {
      return event;
    }

    await this.transport.publish(event);
    return event;
  }

  /** Fire-and-forget async publish (does not await handlers). */
  publishAsync<TPayload>(
    topic: string,
    payload: TPayload,
    options: PublishOptions = {},
  ): void {
    void this.publish(topic, payload, options);
  }

  subscribe<TPayload = unknown>(
    pattern: string,
    handler: EventHandler<TPayload>,
  ): Subscription {
    if (!this.enabled) {
      return {
        id: 'disabled',
        pattern,
        unsubscribe: () => undefined,
      };
    }
    return this.transport.subscribe(pattern, handler);
  }

  unsubscribe(subscriptionId: string): boolean {
    if (!this.enabled || subscriptionId === 'disabled') return false;
    return this.transport.unsubscribe(subscriptionId);
  }

  getStats(): EventBusStats {
    return {
      ...this.transport.getStats(),
      enabled: this.enabled,
    };
  }

  /** Test/helper — remove all subscribers. */
  clear(): void {
    this.transport.clear();
  }

  onModuleDestroy(): void {
    this.transport.clear();
  }
}
