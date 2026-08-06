import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import type { ISubscriptionManager } from '../contracts';
import type { StreamSubscription } from '../models/streaming.models';
import { StreamingError } from '../models/streaming.models';

/**
 * Subscription Manager — transport-independent subscriber registry.
 */
@Injectable()
export class SubscriptionManager implements ISubscriptionManager {
  private readonly subscriptions = new Map<string, StreamSubscription>();

  constructor(private readonly config: ConfigService) {}

  register(streamId: string, workflowId: string): StreamSubscription {
    if (this.subscriptions.size >= this.config.streaming.maxSubscribers) {
      throw new StreamingError(
        `Max subscribers exceeded (${this.config.streaming.maxSubscribers})`,
      );
    }
    const sub = Object.freeze({
      id: randomUUID(),
      streamId,
      workflowId,
      createdAt: new Date().toISOString(),
    });
    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  unregister(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  count(streamId?: string): number {
    if (!streamId) return this.subscriptions.size;
    let n = 0;
    for (const sub of this.subscriptions.values()) {
      if (sub.streamId === streamId) n += 1;
    }
    return n;
  }

  list(streamId: string): readonly StreamSubscription[] {
    return Object.freeze(
      [...this.subscriptions.values()].filter((s) => s.streamId === streamId),
    );
  }
}
