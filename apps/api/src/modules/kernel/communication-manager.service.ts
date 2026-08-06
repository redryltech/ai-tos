import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import type {
  BroadcastInput,
  CommEndpoint,
  CommEndpointKind,
  CommMessage,
  CommMessageHandler,
  CommunicationStats,
  RequestInput,
  SendMessageInput,
} from './communication.types';
import type { ICommunicationManager } from './contracts/kernel-service.contracts';

interface PendingRequest {
  resolve: (message: CommMessage) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  from: string;
}

/**
 * AI Kernel Communication Manager (Phase 2.2.6).
 * Service/worker messaging · request/response routing · broadcast · point-to-point.
 */
@Injectable()
export class CommunicationManagerService implements ICommunicationManager {
  private readonly endpoints = new Map<string, CommEndpoint>();
  private readonly handlers = new Map<string, Set<CommMessageHandler>>();
  private readonly pending = new Map<string, PendingRequest>();
  private messagesSent = 0;
  private broadcasts = 0;
  private requests = 0;
  private responses = 0;

  constructor(
    private readonly config: ConfigService,
    private readonly eventBus: EventBusService,
  ) {}

  get isEnabled(): boolean {
    return this.config.kernel.commEnabled;
  }

  registerEndpoint(kind: CommEndpointKind, name: string, id?: string): CommEndpoint {
    this.assertEnabled();
    if (!name || name.trim().length === 0) {
      throw new Error('Endpoint name is required');
    }
    const endpoint: CommEndpoint = {
      id: id?.trim() || randomUUID(),
      kind,
      name: name.trim(),
      registeredAt: new Date().toISOString(),
    };
    this.endpoints.set(endpoint.id, endpoint);
    void this.emitBus('kernel.comm.endpoint.registered', {
      id: endpoint.id,
      kind: endpoint.kind,
      name: endpoint.name,
    });
    return { ...endpoint };
  }

  unregisterEndpoint(id: string): boolean {
    const removed = this.endpoints.delete(id);
    if (removed) {
      void this.emitBus('kernel.comm.endpoint.unregistered', { id });
    }
    return removed;
  }

  getEndpoint(id: string): CommEndpoint | undefined {
    const ep = this.endpoints.get(id);
    return ep ? { ...ep } : undefined;
  }

  listEndpoints(kind?: CommEndpointKind): CommEndpoint[] {
    const all = [...this.endpoints.values()];
    const filtered = kind ? all.filter((e) => e.kind === kind) : all;
    return filtered.map((e) => ({ ...e }));
  }

  /** Subscribe a handler to a channel (used for routing inbound messages). */
  subscribe(channel: string, handler: CommMessageHandler): () => void {
    this.assertEnabled();
    if (!channel || channel.trim().length === 0) {
      throw new Error('Channel is required');
    }
    const key = channel.trim();
    let set = this.handlers.get(key);
    if (!set) {
      set = new Set();
      this.handlers.set(key, set);
    }
    set.add(handler);
    return () => {
      set!.delete(handler);
      if (set!.size === 0) this.handlers.delete(key);
    };
  }

  /** Point-to-point message to a specific endpoint. */
  async send<TPayload = unknown>(input: SendMessageInput<TPayload>): Promise<CommMessage<TPayload>> {
    this.assertEnabled();
    this.assertEndpoint(input.from);
    this.assertEndpoint(input.to);

    const message = this.createMessage<TPayload>({
      kind: 'point-to-point',
      channel: input.channel,
      from: input.from,
      to: input.to,
      payload: input.payload,
      correlationId: input.correlationId,
    });

    this.messagesSent += 1;
    await this.deliver(message);
    void this.emitBus('kernel.comm.message.sent', {
      id: message.id,
      kind: message.kind,
      channel: message.channel,
      from: message.from,
      to: message.to,
    });
    return message;
  }

  /** Service → service (or any endpoint) convenience wrapper. */
  async sendToService<TPayload = unknown>(
    input: SendMessageInput<TPayload>,
  ): Promise<CommMessage<TPayload>> {
    const to = this.assertEndpoint(input.to);
    if (to.kind !== 'service') {
      throw new Error(`Target ${input.to} is not a service endpoint`);
    }
    return this.send(input);
  }

  /** Worker messaging convenience wrapper. */
  async sendToWorker<TPayload = unknown>(
    input: SendMessageInput<TPayload>,
  ): Promise<CommMessage<TPayload>> {
    const to = this.assertEndpoint(input.to);
    if (to.kind !== 'worker') {
      throw new Error(`Target ${input.to} is not a worker endpoint`);
    }
    return this.send(input);
  }

  /** Broadcast to all matching endpoints (optionally filtered by kind). */
  async broadcast<TPayload = unknown>(
    input: BroadcastInput<TPayload>,
  ): Promise<CommMessage<TPayload>[]> {
    this.assertEnabled();
    this.assertEndpoint(input.from);

    const targets = this.listEndpoints(input.targetKind).filter((e) => e.id !== input.from);
    const sent: CommMessage<TPayload>[] = [];

    for (const target of targets) {
      const message = this.createMessage<TPayload>({
        kind: 'broadcast',
        channel: input.channel,
        from: input.from,
        to: target.id,
        payload: input.payload,
        correlationId: input.correlationId,
      });
      this.messagesSent += 1;
      await this.deliver(message);
      sent.push(message);
    }

    this.broadcasts += 1;
    void this.emitBus('kernel.comm.broadcast', {
      from: input.from,
      channel: input.channel,
      recipients: sent.length,
      targetKind: input.targetKind ?? 'all',
    });
    return sent;
  }

  /** Request/response with correlation-based response routing. */
  async request<TRequest = unknown, TResponse = unknown>(
    input: RequestInput<TRequest>,
  ): Promise<CommMessage<TResponse>> {
    this.assertEnabled();
    this.assertEndpoint(input.from);
    this.assertEndpoint(input.to);

    if (this.pending.size >= this.config.kernel.commMaxPendingRequests) {
      throw new Error('CommunicationManagerService pending request capacity exceeded');
    }

    const correlationId = input.correlationId ?? randomUUID();
    const timeoutMs = input.timeoutMs ?? this.config.kernel.commRequestTimeoutMs;

    const message = this.createMessage<TRequest>({
      kind: 'request',
      channel: input.channel,
      from: input.from,
      to: input.to,
      payload: input.payload,
      correlationId,
      replyTo: input.from,
    });

    const responsePromise = new Promise<CommMessage<TResponse>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(correlationId);
        reject(new Error(`Request timed out after ${timeoutMs}ms (${correlationId})`));
      }, timeoutMs);

      this.pending.set(correlationId, {
        resolve: resolve as (message: CommMessage) => void,
        reject,
        timer,
        from: input.from,
      });
    });

    this.messagesSent += 1;
    this.requests += 1;
    await this.deliver(message);
    void this.emitBus('kernel.comm.request', {
      id: message.id,
      channel: message.channel,
      from: message.from,
      to: message.to,
      correlationId,
    });

    return responsePromise;
  }

  /** Route a response to a pending request by correlation id. */
  async respond(
    from: string,
    to: string,
    channel: string,
    correlationId: string,
    payload: unknown,
  ): Promise<CommMessage> {
    this.assertEnabled();
    this.assertEndpoint(from);
    this.assertEndpoint(to);

    const message = this.createMessage({
      kind: 'response',
      channel,
      from,
      to,
      payload,
      correlationId,
    });

    this.messagesSent += 1;
    this.responses += 1;

    const pending = this.pending.get(correlationId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pending.delete(correlationId);
      pending.resolve(message);
    }

    await this.deliver(message);
    void this.emitBus('kernel.comm.response', {
      id: message.id,
      channel: message.channel,
      from: message.from,
      to: message.to,
      correlationId,
    });
    return message;
  }

  stats(): CommunicationStats {
    let services = 0;
    let workers = 0;
    for (const ep of this.endpoints.values()) {
      if (ep.kind === 'service') services += 1;
      else workers += 1;
    }
    return {
      endpoints: this.endpoints.size,
      services,
      workers,
      pendingRequests: this.pending.size,
      messagesSent: this.messagesSent,
      broadcasts: this.broadcasts,
      requests: this.requests,
      responses: this.responses,
    };
  }

  clear(): void {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('CommunicationManagerService cleared'));
    }
    this.pending.clear();
    this.endpoints.clear();
    this.handlers.clear();
    this.messagesSent = 0;
    this.broadcasts = 0;
    this.requests = 0;
    this.responses = 0;
  }

  private createMessage<TPayload>(input: {
    kind: CommMessage['kind'];
    channel: string;
    from: string;
    to?: string;
    payload: TPayload;
    correlationId?: string;
    replyTo?: string;
  }): CommMessage<TPayload> {
    if (!input.channel || input.channel.trim().length === 0) {
      throw new Error('Channel is required');
    }
    return {
      id: randomUUID(),
      kind: input.kind,
      channel: input.channel.trim(),
      from: input.from,
      to: input.to,
      payload: input.payload,
      correlationId: input.correlationId,
      replyTo: input.replyTo,
      createdAt: new Date().toISOString(),
    };
  }

  private async deliver(message: CommMessage): Promise<void> {
    const handlers = this.handlers.get(message.channel);
    if (!handlers || handlers.size === 0) return;

    for (const handler of [...handlers]) {
      const result = await handler({
        message,
        reply: async (payload: unknown) => {
          if (!message.replyTo || !message.correlationId || !message.to) return;
          return this.respond(
            message.to,
            message.replyTo,
            message.channel,
            message.correlationId,
            payload,
          );
        },
      });

      if (
        message.kind === 'request' &&
        result !== undefined &&
        message.replyTo &&
        message.correlationId &&
        message.to
      ) {
        await this.respond(
          message.to,
          message.replyTo,
          message.channel,
          message.correlationId,
          result,
        );
      }
    }
  }

  private assertEndpoint(id: string): CommEndpoint {
    const ep = this.endpoints.get(id);
    if (!ep) {
      throw new Error(`Unknown communication endpoint: ${id}`);
    }
    return ep;
  }

  private assertEnabled(): void {
    if (!this.config.kernel.commEnabled) {
      throw new Error('CommunicationManagerService is disabled');
    }
  }

  private async emitBus(topic: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.config.kernel.commEmitEvents) return;
    await this.eventBus.publish(topic, payload, { source: 'ai-kernel' });
  }
}
