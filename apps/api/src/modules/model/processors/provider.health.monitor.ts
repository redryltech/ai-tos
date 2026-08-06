import { Injectable } from '@nestjs/common';
import type { IProviderHealthMonitor } from '../contracts';
import type {
  ProviderHealthSnapshot,
  ProviderHealthStatus,
} from '../models/model.models';

/**
 * Provider Health Monitor — availability/latency/failures/recovery.
 * Never performs routing.
 */
@Injectable()
export class ProviderHealthMonitor implements IProviderHealthMonitor {
  private readonly snapshots = new Map<string, ProviderHealthSnapshot>();

  recordSuccess(providerId: string, latencyMs: number): void {
    const prev = this.snapshots.get(providerId);
    const failureCount = prev?.failureCount ?? 0;
    const availability = this.computeAvailability(failureCount, true);
    this.snapshots.set(
      providerId,
      Object.freeze({
        providerId,
        status: this.toStatus(availability, failureCount),
        latencyMs,
        availability,
        failureCount: Math.max(0, failureCount - 1),
        lastCheckedAt: Date.now(),
      }),
    );
  }

  recordFailure(providerId: string, error: string, latencyMs: number): void {
    const prev = this.snapshots.get(providerId);
    const failureCount = (prev?.failureCount ?? 0) + 1;
    const availability = this.computeAvailability(failureCount, false);
    this.snapshots.set(
      providerId,
      Object.freeze({
        providerId,
        status: this.toStatus(availability, failureCount),
        latencyMs,
        availability,
        failureCount,
        lastCheckedAt: Date.now(),
        lastError: error,
      }),
    );
  }

  get(providerId: string): ProviderHealthSnapshot | undefined {
    return this.snapshots.get(providerId);
  }

  list(): readonly ProviderHealthSnapshot[] {
    return Object.freeze([...this.snapshots.values()]);
  }

  markRecovered(providerId: string): void {
    const prev = this.snapshots.get(providerId);
    this.snapshots.set(
      providerId,
      Object.freeze({
        providerId,
        status: 'healthy' as const,
        latencyMs: prev?.latencyMs ?? 0,
        availability: 1,
        failureCount: 0,
        lastCheckedAt: Date.now(),
      }),
    );
  }

  private computeAvailability(failureCount: number, success: boolean): number {
    if (failureCount <= 0 && success) return 1;
    return Math.max(0, 1 - failureCount * 0.25);
  }

  private toStatus(
    availability: number,
    failureCount: number,
  ): ProviderHealthStatus {
    if (failureCount >= 3 || availability <= 0.25) return 'unhealthy';
    if (failureCount >= 1 || availability < 0.75) return 'degraded';
    return 'healthy';
  }
}
