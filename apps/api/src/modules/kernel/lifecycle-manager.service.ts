import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import {
  canLifecycleTransition,
  LIFECYCLE_ACTION_TARGET,
  TERMINAL_LIFECYCLE_PHASES,
  type CreateLifecycleInput,
  type LifecycleAction,
  type LifecycleActionOptions,
  type LifecycleManagerStats,
  type LifecyclePhase,
  type LifecycleRecord,
} from './lifecycle.types';
import type { ILifecycleStore } from './storage/kernel-store.contracts';
import { LIFECYCLE_STORE } from './storage/kernel-store.contracts';
import type { ILifecycleManager } from './contracts/kernel-service.contracts';

/**
 * AI Kernel Lifecycle Manager (Phase 2.2.5).
 * Start · pause · resume · stop · cancel · complete for tasks and executions.
 */
@Injectable()
export class LifecycleManagerService implements ILifecycleManager {
  constructor(
    private readonly config: ConfigService,
    private readonly eventBus: EventBusService,
    @Inject(LIFECYCLE_STORE) private readonly lifecycleStore: ILifecycleStore,
  ) {}

  get isEnabled(): boolean {
    return this.config.kernel.lifecycleEnabled;
  }

  register(input: CreateLifecycleInput): LifecycleRecord {
    this.assertEnabled();
    if (!input.type || input.type.trim().length === 0) {
      throw new Error('Lifecycle type is required');
    }

    this.evictIfNeeded();

    const now = new Date().toISOString();
    const record: LifecycleRecord = {
      id: randomUUID(),
      kind: input.kind,
      type: input.type.trim(),
      phase: 'created',
      refId: input.refId,
      correlationId: input.correlationId,
      organizationId: input.organizationId,
      userId: input.userId,
      metadata: { ...(input.metadata ?? {}) },
      createdAt: now,
      updatedAt: now,
      startedAt: null,
      pausedAt: null,
      endedAt: null,
      history: [{ action: 'register', from: null, to: 'created', at: now }],
    };

    this.lifecycleStore.save(record);
    void this.emit('kernel.lifecycle.registered', record, 'register');
    return this.clone(record);
  }

  get(id: string): LifecycleRecord | undefined {
    const record = this.lifecycleStore.get(id);
    return record ? this.clone(record) : undefined;
  }

  list(phase?: LifecyclePhase): LifecycleRecord[] {
    return this.lifecycleStore.list(phase).map((r) => this.clone(r));
  }

  stats(): LifecycleManagerStats {
    const stats: LifecycleManagerStats = {
      total: this.lifecycleStore.size(),
      created: 0,
      running: 0,
      paused: 0,
      stopped: 0,
      cancelled: 0,
      completed: 0,
    };
    for (const record of this.lifecycleStore.values()) {
      stats[record.phase] += 1;
    }
    return stats;
  }

  start(id: string, options: LifecycleActionOptions = {}): LifecycleRecord {
    return this.apply(id, 'start', options);
  }

  pause(id: string, options: LifecycleActionOptions = {}): LifecycleRecord {
    return this.apply(id, 'pause', options);
  }

  resume(id: string, options: LifecycleActionOptions = {}): LifecycleRecord {
    return this.apply(id, 'resume', options);
  }

  stop(id: string, options: LifecycleActionOptions = {}): LifecycleRecord {
    return this.apply(id, 'stop', options);
  }

  cancel(id: string, options: LifecycleActionOptions = {}): LifecycleRecord {
    return this.apply(id, 'cancel', options);
  }

  complete(id: string, options: LifecycleActionOptions = {}): LifecycleRecord {
    return this.apply(id, 'complete', options);
  }

  remove(id: string): boolean {
    const record = this.lifecycleStore.get(id);
    if (!record || !TERMINAL_LIFECYCLE_PHASES.has(record.phase)) {
      return false;
    }
    this.lifecycleStore.delete(id);
    void this.emit('kernel.lifecycle.removed', record, 'stop');
    return true;
  }

  clear(): void {
    this.lifecycleStore.clear();
  }

  private apply(
    id: string,
    action: LifecycleAction,
    options: LifecycleActionOptions,
  ): LifecycleRecord {
    this.assertEnabled();
    const record = this.lifecycleStore.get(id);
    if (!record) {
      throw new Error(`Lifecycle not found: ${id}`);
    }
    if (TERMINAL_LIFECYCLE_PHASES.has(record.phase)) {
      throw new Error(`Cannot ${action} from terminal phase: ${record.phase}`);
    }

    const to = LIFECYCLE_ACTION_TARGET[action];
    if (!canLifecycleTransition(record.phase, to)) {
      throw new Error(`Invalid lifecycle action ${action}: ${record.phase} → ${to}`);
    }

    const from = record.phase;
    const now = new Date().toISOString();
    record.phase = to;
    record.updatedAt = now;
    record.history.push({
      action,
      from,
      to,
      at: now,
      reason: options.reason,
    });

    if (options.metadata) {
      record.metadata = { ...record.metadata, ...options.metadata };
    }
    if (options.error !== undefined) record.error = options.error;
    if (options.result !== undefined) record.result = options.result;

    this.applyTimestamps(record, action, now);
    this.lifecycleStore.save(record);
    void this.emit(`kernel.lifecycle.${action}`, record, action, { from, to });
    return this.clone(record);
  }

  private applyTimestamps(
    record: LifecycleRecord,
    action: LifecycleAction,
    now: string,
  ): void {
    switch (action) {
      case 'start':
        if (!record.startedAt) record.startedAt = now;
        record.pausedAt = null;
        break;
      case 'pause':
        record.pausedAt = now;
        break;
      case 'resume':
        record.pausedAt = null;
        break;
      case 'stop':
      case 'cancel':
      case 'complete':
        record.endedAt = now;
        record.pausedAt = null;
        break;
      default:
        break;
    }
  }

  private assertEnabled(): void {
    if (!this.config.kernel.lifecycleEnabled) {
      throw new Error('LifecycleManagerService is disabled');
    }
  }

  private evictIfNeeded(): void {
    const max = this.config.kernel.lifecycleMaxEntries;
    if (this.lifecycleStore.size() < max) return;

    for (const record of [...this.lifecycleStore.values()]) {
      if (TERMINAL_LIFECYCLE_PHASES.has(record.phase)) {
        this.lifecycleStore.delete(record.id);
        if (this.lifecycleStore.size() < max) return;
      }
    }

    if (this.lifecycleStore.size() >= max) {
      throw new Error(`LifecycleManagerService capacity exceeded (${max})`);
    }
  }

  private clone(record: LifecycleRecord): LifecycleRecord {
    return {
      ...record,
      metadata: { ...record.metadata },
      history: record.history.map((h) => ({ ...h })),
    };
  }

  private async emit(
    topic: string,
    record: LifecycleRecord,
    action: LifecycleAction | 'register',
    extra: Record<string, unknown> = {},
  ): Promise<void> {
    if (!this.config.kernel.lifecycleEmitEvents) return;
    await this.eventBus.publish(
      topic,
      {
        id: record.id,
        kind: record.kind,
        type: record.type,
        phase: record.phase,
        action,
        refId: record.refId,
        ...extra,
      },
      {
        correlationId: record.correlationId,
        organizationId: record.organizationId,
        userId: record.userId,
        source: 'ai-kernel',
      },
    );
  }
}
