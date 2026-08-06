import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import {
  canTransition,
  TERMINAL_EXECUTION_STATES,
  type CreateExecutionInput,
  type ExecutionRecord,
  type ExecutionState,
  type StateManagerStats,
  type TransitionOptions,
} from './execution-state.types';
import type { IStateStore } from './storage/kernel-store.contracts';
import { STATE_STORE } from './storage/kernel-store.contracts';
import type { IStateManager } from './contracts/kernel-service.contracts';

/**
 * Centralized execution state manager (Phase 2.2.3).
 * Tracks pending → scheduled → running → waiting → completed/failed/cancelled.
 */
@Injectable()
export class StateManagerService implements IStateManager {
  constructor(
    private readonly config: ConfigService,
    private readonly eventBus: EventBusService,
    @Inject(STATE_STORE) private readonly stateStore: IStateStore,
  ) {}

  get isEnabled(): boolean {
    return this.config.kernel.stateEnabled;
  }

  create(input: CreateExecutionInput): ExecutionRecord {
    this.assertEnabled();
    if (!input.type || input.type.trim().length === 0) {
      throw new Error('Execution type is required');
    }

    this.evictIfNeeded();

    const now = new Date().toISOString();
    const initial: ExecutionState = input.initialState ?? 'pending';
    const record: ExecutionRecord = {
      id: randomUUID(),
      type: input.type.trim(),
      state: initial,
      refId: input.refId,
      correlationId: input.correlationId,
      organizationId: input.organizationId,
      userId: input.userId,
      metadata: { ...(input.metadata ?? {}) },
      createdAt: now,
      updatedAt: now,
      scheduledAt: initial === 'scheduled' ? now : null,
      startedAt: null,
      waitingAt: null,
      completedAt: null,
      history: [],
    };

    this.stateStore.save(record);
    void this.emit('kernel.state.created', record);
    return this.clone(record);
  }

  get(id: string): ExecutionRecord | undefined {
    const record = this.stateStore.get(id);
    return record ? this.clone(record) : undefined;
  }

  list(state?: ExecutionState): ExecutionRecord[] {
    return this.stateStore.list(state).map((r) => this.clone(r));
  }

  stats(): StateManagerStats {
    const stats: StateManagerStats = {
      total: this.stateStore.size(),
      pending: 0,
      scheduled: 0,
      running: 0,
      waiting: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };
    for (const record of this.stateStore.values()) {
      stats[record.state] += 1;
    }
    return stats;
  }

  transition(id: string, to: ExecutionState, options: TransitionOptions = {}): ExecutionRecord {
    this.assertEnabled();
    const record = this.stateStore.get(id);
    if (!record) {
      throw new Error(`Execution not found: ${id}`);
    }
    if (TERMINAL_EXECUTION_STATES.has(record.state)) {
      throw new Error(`Cannot transition from terminal state: ${record.state}`);
    }
    if (!canTransition(record.state, to)) {
      throw new Error(`Invalid transition: ${record.state} → ${to}`);
    }

    const from = record.state;
    const now = new Date().toISOString();
    record.state = to;
    record.updatedAt = now;
    record.history.push({ from, to, at: now, reason: options.reason });

    if (options.metadata) {
      record.metadata = { ...record.metadata, ...options.metadata };
    }
    if (options.error !== undefined) {
      record.error = options.error;
    }
    if (options.result !== undefined) {
      record.result = options.result;
    }

    this.applyTimestamps(record, to, now);
    this.stateStore.save(record);
    void this.emit('kernel.state.transitioned', record, { from, to });
    return this.clone(record);
  }

  schedule(id: string, options: TransitionOptions = {}): ExecutionRecord {
    return this.transition(id, 'scheduled', options);
  }

  start(id: string, options: TransitionOptions = {}): ExecutionRecord {
    return this.transition(id, 'running', options);
  }

  wait(id: string, options: TransitionOptions = {}): ExecutionRecord {
    return this.transition(id, 'waiting', options);
  }

  complete(id: string, options: TransitionOptions = {}): ExecutionRecord {
    return this.transition(id, 'completed', options);
  }

  fail(id: string, options: TransitionOptions = {}): ExecutionRecord {
    return this.transition(id, 'failed', options);
  }

  cancel(id: string, options: TransitionOptions = {}): ExecutionRecord {
    return this.transition(id, 'cancelled', options);
  }

  remove(id: string): boolean {
    const record = this.stateStore.get(id);
    if (!record || !TERMINAL_EXECUTION_STATES.has(record.state)) {
      return false;
    }
    this.stateStore.delete(id);
    void this.emit('kernel.state.removed', record);
    return true;
  }

  clear(): void {
    this.stateStore.clear();
  }

  private applyTimestamps(record: ExecutionRecord, to: ExecutionState, now: string): void {
    switch (to) {
      case 'scheduled':
        record.scheduledAt = now;
        break;
      case 'running':
        if (!record.startedAt) record.startedAt = now;
        record.waitingAt = null;
        break;
      case 'waiting':
        record.waitingAt = now;
        break;
      case 'completed':
      case 'failed':
      case 'cancelled':
        record.completedAt = now;
        break;
      default:
        break;
    }
  }

  private assertEnabled(): void {
    if (!this.config.kernel.stateEnabled) {
      throw new Error('StateManagerService is disabled');
    }
  }

  private evictIfNeeded(): void {
    const max = this.config.kernel.stateMaxEntries;
    if (this.stateStore.size() < max) return;

    for (const record of [...this.stateStore.values()]) {
      if (TERMINAL_EXECUTION_STATES.has(record.state)) {
        this.stateStore.delete(record.id);
        if (this.stateStore.size() < max) return;
      }
    }

    if (this.stateStore.size() >= max) {
      throw new Error(`StateManagerService capacity exceeded (${max})`);
    }
  }

  private clone(record: ExecutionRecord): ExecutionRecord {
    return {
      ...record,
      metadata: { ...record.metadata },
      history: record.history.map((h) => ({ ...h })),
    };
  }

  private async emit(
    topic: string,
    record: ExecutionRecord,
    extra: Record<string, unknown> = {},
  ): Promise<void> {
    if (!this.config.kernel.stateEmitEvents) return;
    await this.eventBus.publish(
      topic,
      {
        id: record.id,
        type: record.type,
        state: record.state,
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
