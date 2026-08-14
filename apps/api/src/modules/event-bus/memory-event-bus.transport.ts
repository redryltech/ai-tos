import { randomUUID } from 'node:crypto';
import type {
  AiOsEvent,
  EventBusStats,
  EventBusTransport,
  EventHandler,
  Subscription,
} from './event.types';
import { topicMatches } from './event-routing';

interface InternalSubscription {
  id: string;
  pattern: string;
  handler: EventHandler;
}

/**
 * In-process async event transport with topic routing.
 *
 * Transport posture: local / development / single-process default.
 * Not a production broker selection. Durable/distributed transports remain an
 * open F-010 G-07 implementation decision; Event ≠ Outcome; EventBus ≠ Orchestrator.
 */
export class MemoryEventBusTransport implements EventBusTransport {
  readonly driver = 'memory';
  private readonly subscriptions = new Map<string, InternalSubscription>();
  private published = 0;
  private delivered = 0;
  private errors = 0;

  constructor(
    private readonly maxListenersPerTopic: number,
    private readonly dispatch: 'parallel' | 'sequential',
  ) {}

  async publish<T>(event: AiOsEvent<T>): Promise<void> {
    this.published += 1;
    const matched = [...this.subscriptions.values()].filter((s) =>
      topicMatches(s.pattern, event.topic),
    );

    if (this.dispatch === 'sequential') {
      for (const sub of matched) {
        await this.invoke(sub, event);
      }
      return;
    }

    await Promise.all(matched.map((sub) => this.invoke(sub, event)));
  }

  subscribe<T>(pattern: string, handler: EventHandler<T>): Subscription {
    const countForPattern = [...this.subscriptions.values()].filter(
      (s) => s.pattern === pattern,
    ).length;
    if (countForPattern >= this.maxListenersPerTopic) {
      throw new Error(
        `Max listeners (${this.maxListenersPerTopic}) reached for pattern "${pattern}"`,
      );
    }

    const id = randomUUID();
    this.subscriptions.set(id, {
      id,
      pattern,
      handler: handler as EventHandler,
    });

    return {
      id,
      pattern,
      unsubscribe: () => {
        this.unsubscribe(id);
      },
    };
  }

  unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  clear(): void {
    this.subscriptions.clear();
  }

  getStats(): Omit<EventBusStats, 'enabled'> {
    const topics = new Set([...this.subscriptions.values()].map((s) => s.pattern));
    return {
      published: this.published,
      delivered: this.delivered,
      errors: this.errors,
      subscribers: this.subscriptions.size,
      topics: topics.size,
      driver: this.driver,
    };
  }

  private async invoke(sub: InternalSubscription, event: AiOsEvent): Promise<void> {
    try {
      await sub.handler(event);
      this.delivered += 1;
    } catch {
      this.errors += 1;
    }
  }
}
