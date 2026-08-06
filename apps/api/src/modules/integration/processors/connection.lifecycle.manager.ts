import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import type { IConnectionLifecycleManager } from '../contracts';
import type {
  ConnectionSession,
  IntegrationAuthMode,
} from '../models/integration.models';

/**
 * Connection Lifecycle Manager — auth, connect, refresh, pool, terminate.
 * Never performs business logic or real vendor I/O.
 */
@Injectable()
export class ConnectionLifecycleManager implements IConnectionLifecycleManager {
  private readonly sessions = new Map<string, ConnectionSession>();
  private poolCursor = 0;

  constructor(private readonly config: ConfigService) {}

  authenticate(
    connectorId: string,
    mode?: IntegrationAuthMode,
    secretRef?: string,
  ): ConnectionSession {
    const authMode = mode ?? this.config.integration.defaultAuthMode;
    if (!secretRef || secretRef.trim().length === 0) {
      const failed = Object.freeze({
        connectorId,
        sessionId: randomUUID(),
        state: 'error' as const,
        authMode,
        poolSlot: -1,
        lastError: 'missing_credentials',
      });
      this.sessions.set(connectorId, failed);
      return failed;
    }

    const session = Object.freeze({
      connectorId,
      sessionId: randomUUID(),
      state: 'authenticating' as const,
      authMode,
      poolSlot: this.nextPoolSlot(),
      credentialRef: secretRef,
    });
    this.sessions.set(connectorId, session);
    return session;
  }

  connect(connectorId: string): ConnectionSession {
    const existing = this.sessions.get(connectorId);
    if (!existing || existing.state === 'error' || !existing.credentialRef) {
      const failed = Object.freeze({
        connectorId,
        sessionId: existing?.sessionId ?? randomUUID(),
        state: 'error' as const,
        authMode: existing?.authMode ?? this.config.integration.defaultAuthMode,
        poolSlot: existing?.poolSlot ?? -1,
        lastError: 'not_authenticated',
      });
      this.sessions.set(connectorId, failed);
      return failed;
    }

    const connected = Object.freeze({
      ...existing,
      state: 'connected' as const,
      connectedAt: Date.now(),
      lastError: undefined,
    });
    this.sessions.set(connectorId, connected);
    return connected;
  }

  refresh(connectorId: string): ConnectionSession {
    const existing = this.sessions.get(connectorId);
    if (!existing?.credentialRef) {
      return this.authenticate(connectorId);
    }
    const refreshed = Object.freeze({
      ...existing,
      sessionId: randomUUID(),
      state: 'authenticating' as const,
      credentialRef: `${existing.credentialRef}:refreshed`,
      lastError: undefined,
    });
    this.sessions.set(connectorId, refreshed);
    return this.connect(connectorId);
  }

  disconnect(connectorId: string): ConnectionSession {
    const existing = this.sessions.get(connectorId);
    const disconnected = Object.freeze({
      connectorId,
      sessionId: existing?.sessionId ?? randomUUID(),
      state: 'disconnected' as const,
      authMode: existing?.authMode ?? this.config.integration.defaultAuthMode,
      poolSlot: existing?.poolSlot ?? -1,
      credentialRef: existing?.credentialRef,
    });
    this.sessions.set(connectorId, disconnected);
    return disconnected;
  }

  getSession(connectorId: string): ConnectionSession | undefined {
    return this.sessions.get(connectorId);
  }

  listSessions(): readonly ConnectionSession[] {
    return Object.freeze([...this.sessions.values()]);
  }

  recover(connectorId: string): ConnectionSession {
    const existing = this.sessions.get(connectorId);
    if (!existing?.credentialRef) {
      this.authenticate(connectorId, undefined, `secret://${connectorId}`);
    }
    return this.connect(connectorId);
  }

  private nextPoolSlot(): number {
    const size = this.config.integration.poolSize;
    const slot = this.poolCursor % size;
    this.poolCursor = (this.poolCursor + 1) % size;
    return slot;
  }
}
