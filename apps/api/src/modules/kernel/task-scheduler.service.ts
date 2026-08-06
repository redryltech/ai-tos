import { randomUUID } from 'node:crypto';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import type { ITaskStore } from './storage/kernel-store.contracts';
import { TASK_STORE } from './storage/kernel-store.contracts';
import type { ITaskScheduler } from './contracts/kernel-service.contracts';
import { TaskPriorityQueue } from './task-priority-queue';
import type {
  CreateTaskInput,
  KernelTask,
  TaskHandler,
  TaskSchedulerStats,
  TaskState,
} from './task.types';

const TERMINAL: ReadonlySet<TaskState> = new Set(['completed', 'failed', 'cancelled']);

/**
 * AI Kernel Task Scheduler (Phase 2.2.1).
 * FIFO + priority · delayed · retry · timeout · cancellation · Event Bus integration.
 */
@Injectable()
export class TaskSchedulerService implements OnModuleInit, OnModuleDestroy, ITaskScheduler {
  private readonly ready = new TaskPriorityQueue();
  private readonly handlers = new Map<string, TaskHandler>();
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly cancelledIds = new Set<string>();
  private runningCount = 0;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private ticking = false;

  constructor(
    private readonly config: ConfigService,
    private readonly eventBus: EventBusService,
    @Inject(TASK_STORE) private readonly taskStore: ITaskStore,
  ) {}

  onModuleInit(): void {
    if (!this.config.kernel.schedulerEnabled) return;
    this.tickTimer = setInterval(() => {
      void this.tick();
    }, this.config.kernel.tickMs);
    if (typeof this.tickTimer.unref === 'function') {
      this.tickTimer.unref();
    }
  }

  onModuleDestroy(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    for (const [id, controller] of this.abortControllers) {
      controller.abort();
      this.abortControllers.delete(id);
    }
  }

  registerHandler(type: string, handler: TaskHandler): void {
    if (!type || type.trim().length === 0) {
      throw new Error('Task type is required');
    }
    this.handlers.set(type, handler);
  }

  unregisterHandler(type: string): boolean {
    return this.handlers.delete(type);
  }

  createTask<TPayload = unknown>(input: CreateTaskInput<TPayload>): KernelTask<TPayload> {
    if (!input.type || input.type.trim().length === 0) {
      throw new Error('Task type is required');
    }

    const cfg = this.config.kernel;
    const now = Date.now();
    const scheduledForMs = this.resolveScheduleMs(input, now);
    const isDelayed = scheduledForMs > now;
    const state: TaskState = isDelayed ? 'scheduled' : 'pending';

    const task: KernelTask<TPayload> = {
      id: randomUUID(),
      type: input.type,
      payload: (input.payload ?? {}) as TPayload,
      priority: input.priority ?? cfg.defaultPriority,
      state,
      createdAt: new Date(now).toISOString(),
      scheduledFor: isDelayed ? new Date(scheduledForMs).toISOString() : null,
      startedAt: null,
      completedAt: null,
      attempts: 0,
      maxRetries: input.maxRetries ?? cfg.defaultMaxRetries,
      timeoutMs: input.timeoutMs ?? cfg.defaultTimeoutMs,
      correlationId: input.correlationId,
      organizationId: input.organizationId,
      userId: input.userId,
      sequence: this.taskStore.nextSequence(),
    };

    this.taskStore.save(task as KernelTask);
    void this.emit('kernel.task.created', task);

    if (!isDelayed) {
      this.ready.enqueue(task as KernelTask);
      void this.emit('kernel.task.scheduled', task);
    }

    return task;
  }

  getTask(taskId: string): KernelTask | null {
    return this.taskStore.get(taskId) ?? null;
  }

  listTasks(state?: TaskState): KernelTask[] {
    return this.taskStore.list(state);
  }

  cancelTask(taskId: string): boolean {
    const task = this.taskStore.get(taskId);
    if (!task || TERMINAL.has(task.state)) return false;

    if (task.state === 'running') {
      this.cancelledIds.add(taskId);
      this.abortControllers.get(taskId)?.abort();
      return true;
    }

    this.ready.remove(taskId);
    task.state = 'cancelled';
    task.completedAt = new Date().toISOString();
    this.taskStore.save(task);
    void this.emit('kernel.task.cancelled', task);
    return true;
  }

  getStats(): TaskSchedulerStats {
    const counts: Record<TaskState, number> = {
      pending: 0,
      scheduled: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };
    for (const task of this.taskStore.values()) {
      counts[task.state] += 1;
    }
    return {
      total: this.taskStore.size(),
      ...counts,
      enabled: this.config.kernel.schedulerEnabled,
    };
  }

  async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      this.promoteScheduled();
      const max = this.config.kernel.maxConcurrency;
      while (this.runningCount < max) {
        const next = this.ready.dequeue();
        if (!next) break;
        if (next.state === 'cancelled') continue;
        void this.execute(next);
      }
    } finally {
      this.ticking = false;
    }
  }

  resetForTests(): void {
    this.ready.clear();
    this.taskStore.clear();
    this.handlers.clear();
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
    this.cancelledIds.clear();
    this.runningCount = 0;
  }

  private promoteScheduled(): void {
    const now = Date.now();
    for (const task of this.taskStore.values()) {
      if (task.state !== 'scheduled' || !task.scheduledFor) continue;
      if (Date.parse(task.scheduledFor) <= now) {
        task.state = 'pending';
        this.taskStore.save(task);
        this.ready.enqueue(task);
        void this.emit('kernel.task.scheduled', task);
      }
    }
  }

  private async execute(task: KernelTask): Promise<void> {
    const handler = this.handlers.get(task.type);
    if (!handler) {
      task.state = 'failed';
      task.completedAt = new Date().toISOString();
      task.error = `No handler registered for task type "${task.type}"`;
      this.taskStore.save(task);
      void this.emit('kernel.task.failed', task);
      return;
    }

    const controller = new AbortController();
    this.abortControllers.set(task.id, controller);
    this.runningCount += 1;
    task.state = 'running';
    task.startedAt = new Date().toISOString();
    task.attempts += 1;
    this.taskStore.save(task);
    void this.emit('kernel.task.started', task);

    try {
      const result = await this.runWithTimeout(handler, task, controller);
      if (this.cancelledIds.has(task.id)) {
        task.state = 'cancelled';
        task.completedAt = new Date().toISOString();
        this.cancelledIds.delete(task.id);
        this.taskStore.save(task);
        void this.emit('kernel.task.cancelled', task);
        return;
      }
      task.result = result;
      task.state = 'completed';
      task.completedAt = new Date().toISOString();
      this.taskStore.save(task);
      void this.emit('kernel.task.completed', task);
    } catch (err) {
      if (this.cancelledIds.has(task.id)) {
        task.state = 'cancelled';
        task.completedAt = new Date().toISOString();
        this.cancelledIds.delete(task.id);
        this.taskStore.save(task);
        void this.emit('kernel.task.cancelled', task);
        return;
      }

      const message = err instanceof Error ? err.message : String(err);
      task.error = message;

      if (task.attempts <= task.maxRetries) {
        const delay = this.config.kernel.retryBackoffMs * task.attempts;
        task.state = 'scheduled';
        task.scheduledFor = new Date(Date.now() + delay).toISOString();
        task.startedAt = null;
        this.taskStore.save(task);
        void this.emit('kernel.task.retry_scheduled', task);
      } else {
        task.state = 'failed';
        task.completedAt = new Date().toISOString();
        this.taskStore.save(task);
        void this.emit('kernel.task.failed', task);
      }
    } finally {
      this.abortControllers.delete(task.id);
      this.runningCount = Math.max(0, this.runningCount - 1);
    }
  }

  private async runWithTimeout(
    handler: TaskHandler,
    task: KernelTask,
    controller: AbortController,
  ): Promise<unknown> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error(`Task timed out after ${task.timeoutMs}ms`));
      }, task.timeoutMs);
    });

    try {
      return await Promise.race([
        Promise.resolve(handler({ task, signal: controller.signal })),
        timeoutPromise,
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private resolveScheduleMs(input: CreateTaskInput, now: number): number {
    if (input.runAt) {
      const ms = typeof input.runAt === 'string' ? Date.parse(input.runAt) : input.runAt.getTime();
      if (Number.isNaN(ms)) throw new Error('Invalid runAt value');
      return ms;
    }
    if (input.delayMs != null && input.delayMs > 0) {
      return now + input.delayMs;
    }
    return now;
  }

  private async emit(topic: string, task: KernelTask): Promise<void> {
    await this.eventBus.publish(
      topic,
      {
        taskId: task.id,
        type: task.type,
        state: task.state,
        attempts: task.attempts,
        error: task.error,
      },
      {
        correlationId: task.correlationId,
        organizationId: task.organizationId,
        userId: task.userId,
        source: 'ai-kernel',
      },
    );
  }
}
