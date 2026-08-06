/** AI Kernel communication contracts (Phase 2.2.6). */

export type CommEndpointKind = 'service' | 'worker';

export type CommMessageKind = 'point-to-point' | 'broadcast' | 'request' | 'response';

export interface CommEndpoint {
  id: string;
  kind: CommEndpointKind;
  name: string;
  registeredAt: string;
}

export interface CommMessage<TPayload = unknown> {
  id: string;
  kind: CommMessageKind;
  channel: string;
  from: string;
  to?: string;
  payload: TPayload;
  correlationId?: string;
  replyTo?: string;
  createdAt: string;
}

export interface SendMessageInput<TPayload = unknown> {
  from: string;
  to: string;
  channel: string;
  payload: TPayload;
  correlationId?: string;
}

export interface BroadcastInput<TPayload = unknown> {
  from: string;
  channel: string;
  payload: TPayload;
  /** Limit broadcast to endpoint kind when set. */
  targetKind?: CommEndpointKind;
  correlationId?: string;
}

export interface RequestInput<TPayload = unknown> {
  from: string;
  to: string;
  channel: string;
  payload: TPayload;
  timeoutMs?: number;
  correlationId?: string;
}

export interface CommHandlerContext<TPayload = unknown> {
  message: CommMessage<TPayload>;
  reply: (payload: unknown) => Promise<CommMessage | void>;
}

export type CommMessageHandler = (
  ctx: CommHandlerContext,
) => Promise<unknown> | unknown;

export interface CommunicationStats {
  endpoints: number;
  services: number;
  workers: number;
  pendingRequests: number;
  messagesSent: number;
  broadcasts: number;
  requests: number;
  responses: number;
}
