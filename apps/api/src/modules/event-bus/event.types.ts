/**
 * Typed AI OS event contracts (Phase 2.1.7).
 * Topics use dotted routing: layer.domain.action (e.g. kernel.job.started).
 */

/** Well-known layer prefixes for future Kernel / Cognitive / AI / Execution / Workers. */
export type EventLayer =
  | 'kernel'
  | 'cognitive'
  | 'ai'
  | 'execution'
  | 'worker'
  | 'system'
  | 'custom';

export interface AiOsEvent<TPayload = unknown> {
  /** Routing topic, e.g. `ai.request.completed`. */
  topic: string;
  payload: TPayload;
  eventId: string;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  source?: string;
  timestamp: string;
  /** Optional schema/version tag for consumers. */
  version?: string;
}

export type EventHandler<TPayload = unknown> = (
  event: AiOsEvent<TPayload>,
) => void | Promise<void>;

export interface Subscription {
  readonly id: string;
  readonly pattern: string;
  unsubscribe(): void;
}

export interface EventBusStats {
  published: number;
  delivered: number;
  errors: number;
  subscribers: number;
  topics: number;
  enabled: boolean;
  driver: string;
}

/** Transport abstraction — memory now; Kafka/Redis later via EVENT_BUS_URL. */
export interface EventBusTransport {
  readonly driver: string;
  publish<T>(event: AiOsEvent<T>): Promise<void>;
  subscribe<T>(pattern: string, handler: EventHandler<T>): Subscription;
  unsubscribe(subscriptionId: string): boolean;
  clear(): void;
  getStats(): Omit<EventBusStats, 'enabled'>;
}
