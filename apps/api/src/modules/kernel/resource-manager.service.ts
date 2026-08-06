import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import type {
  ModelAllocation,
  ReserveResourcesInput,
  ResourceAvailability,
  ResourceLimits,
  ResourceManagerStats,
  ResourceReservation,
  ResourceUsage,
  WorkerAllocation,
} from './resource.types';
import type { IResourceStore } from './storage/kernel-store.contracts';
import { RESOURCE_STORE } from './storage/kernel-store.contracts';
import type { IResourceManager } from './contracts/kernel-service.contracts';

/**
 * Centralized resource manager (Phase 2.2.4).
 * Worker / AI model allocation · memory & concurrency limits · reservations.
 */
@Injectable()
export class ResourceManagerService implements IResourceManager {
  private readonly expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly config: ConfigService,
    private readonly eventBus: EventBusService,
    @Inject(RESOURCE_STORE) private readonly resourceStore: IResourceStore,
  ) {}

  get isEnabled(): boolean {
    return this.config.kernel.resourceEnabled;
  }

  getLimits(): ResourceLimits {
    const k = this.config.kernel;
    return {
      maxWorkers: k.resourceMaxWorkers,
      maxModelSlots: k.resourceMaxModelSlots,
      maxMemoryMb: k.resourceMaxMemoryMb,
      maxConcurrency: k.resourceMaxConcurrency,
    };
  }

  getUsage(): ResourceUsage {
    this.purgeExpired();
    let workers = 0;
    let modelSlots = 0;
    let memoryMb = 0;
    let concurrency = 0;
    for (const r of this.resourceStore.values()) {
      workers += r.workers;
      modelSlots += r.modelSlots;
      memoryMb += r.memoryMb;
      concurrency += r.concurrency;
    }
    return { workers, modelSlots, memoryMb, concurrency };
  }

  getAvailable(): ResourceAvailability {
    const limits = this.getLimits();
    const usage = this.getUsage();
    return {
      workers: Math.max(0, limits.maxWorkers - usage.workers),
      modelSlots: Math.max(0, limits.maxModelSlots - usage.modelSlots),
      memoryMb: Math.max(0, limits.maxMemoryMb - usage.memoryMb),
      concurrency: Math.max(0, limits.maxConcurrency - usage.concurrency),
    };
  }

  stats(): ResourceManagerStats {
    return {
      limits: this.getLimits(),
      usage: this.getUsage(),
      available: this.getAvailable(),
      activeReservations: this.resourceStore.size(),
    };
  }

  getReservation(id: string): ResourceReservation | undefined {
    this.purgeExpired();
    const r = this.resourceStore.get(id);
    return r ? { ...r } : undefined;
  }

  listReservations(ownerId?: string): ResourceReservation[] {
    this.purgeExpired();
    return this.resourceStore.list(ownerId).map((r) => ({ ...r }));
  }

  reserve(input: ReserveResourcesInput): ResourceReservation {
    this.assertEnabled();
    if (!input.ownerId || input.ownerId.trim().length === 0) {
      throw new Error('ownerId is required');
    }

    const workers = input.workers ?? 0;
    const modelSlots = input.modelSlots ?? 0;
    const memoryMb = input.memoryMb ?? 0;
    const concurrency = input.concurrency ?? 0;

    if (workers < 0 || modelSlots < 0 || memoryMb < 0 || concurrency < 0) {
      throw new Error('Resource amounts must be non-negative');
    }
    if (workers === 0 && modelSlots === 0 && memoryMb === 0 && concurrency === 0) {
      throw new Error('At least one resource amount must be positive');
    }

    this.purgeExpired();
    const available = this.getAvailable();
    if (workers > available.workers) {
      throw new Error(`Worker capacity exceeded (need ${workers}, available ${available.workers})`);
    }
    if (modelSlots > available.modelSlots) {
      throw new Error(
        `Model slot capacity exceeded (need ${modelSlots}, available ${available.modelSlots})`,
      );
    }
    if (memoryMb > available.memoryMb) {
      throw new Error(
        `Memory limit exceeded (need ${memoryMb}MB, available ${available.memoryMb}MB)`,
      );
    }
    if (concurrency > available.concurrency) {
      throw new Error(
        `Concurrency limit exceeded (need ${concurrency}, available ${available.concurrency})`,
      );
    }

    const now = Date.now();
    const expiresAt =
      input.ttlMs && input.ttlMs > 0 ? new Date(now + input.ttlMs).toISOString() : null;

    const reservation: ResourceReservation = {
      id: randomUUID(),
      ownerId: input.ownerId.trim(),
      workers,
      modelSlots,
      memoryMb,
      concurrency,
      modelId: input.modelId,
      workerId: input.workerId,
      correlationId: input.correlationId,
      organizationId: input.organizationId,
      userId: input.userId,
      createdAt: new Date(now).toISOString(),
      expiresAt,
    };

    this.resourceStore.save(reservation);
    if (expiresAt && input.ttlMs) {
      const timer = setTimeout(() => {
        this.release(reservation.id);
      }, input.ttlMs);
      if (typeof timer.unref === 'function') timer.unref();
      this.expiryTimers.set(reservation.id, timer);
    }

    void this.emit('kernel.resource.reserved', reservation);
    return { ...reservation };
  }

  tryReserve(input: ReserveResourcesInput): ResourceReservation | null {
    try {
      return this.reserve(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes('capacity exceeded') ||
        message.includes('limit exceeded') ||
        message.includes('disabled')
      ) {
        return null;
      }
      throw err;
    }
  }

  release(reservationId: string): boolean {
    this.clearExpiry(reservationId);
    const reservation = this.resourceStore.get(reservationId);
    if (!reservation) return false;
    this.resourceStore.delete(reservationId);
    void this.emit('kernel.resource.released', reservation);
    return true;
  }

  releaseAll(ownerId: string): number {
    let count = 0;
    for (const r of [...this.resourceStore.values()]) {
      if (r.ownerId === ownerId && this.release(r.id)) {
        count += 1;
      }
    }
    return count;
  }

  allocateWorker(ownerId: string, workerId?: string): WorkerAllocation {
    const reservation = this.reserve({
      ownerId,
      workers: 1,
      concurrency: 1,
      workerId: workerId ?? `worker-${randomUUID().slice(0, 8)}`,
    });
    return {
      reservationId: reservation.id,
      workerId: reservation.workerId!,
      ownerId: reservation.ownerId,
    };
  }

  allocateModel(ownerId: string, modelId: string, slots = 1): ModelAllocation {
    if (!modelId || modelId.trim().length === 0) {
      throw new Error('modelId is required');
    }
    const reservation = this.reserve({
      ownerId,
      modelSlots: slots,
      concurrency: slots,
      modelId: modelId.trim(),
    });
    return {
      reservationId: reservation.id,
      modelId: reservation.modelId!,
      slots: reservation.modelSlots,
      ownerId: reservation.ownerId,
    };
  }

  clear(): void {
    for (const id of this.expiryTimers.keys()) {
      this.clearExpiry(id);
    }
    this.resourceStore.clear();
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const r of [...this.resourceStore.values()]) {
      if (r.expiresAt && Date.parse(r.expiresAt) <= now) {
        this.release(r.id);
      }
    }
  }

  private clearExpiry(id: string): void {
    const timer = this.expiryTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.expiryTimers.delete(id);
    }
  }

  private assertEnabled(): void {
    if (!this.config.kernel.resourceEnabled) {
      throw new Error('ResourceManagerService is disabled');
    }
  }

  private async emit(topic: string, reservation: ResourceReservation): Promise<void> {
    if (!this.config.kernel.resourceEmitEvents) return;
    await this.eventBus.publish(
      topic,
      {
        id: reservation.id,
        ownerId: reservation.ownerId,
        workers: reservation.workers,
        modelSlots: reservation.modelSlots,
        memoryMb: reservation.memoryMb,
        concurrency: reservation.concurrency,
        modelId: reservation.modelId,
        workerId: reservation.workerId,
      },
      {
        correlationId: reservation.correlationId,
        organizationId: reservation.organizationId,
        userId: reservation.userId,
        source: 'ai-kernel',
      },
    );
  }
}
