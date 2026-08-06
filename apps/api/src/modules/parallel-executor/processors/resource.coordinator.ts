import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutableTask } from '../../task-manager/models/task.models';
import type { IResourceCoordinator } from '../contracts';
import type { ResourceLease, ResourceSnapshot } from '../models/execution.models';

/**
 * Resource Coordinator — ephemeral resource leases for execution waves.
 * No durable ownership. Never executes tasks.
 */
@Injectable()
export class ResourceCoordinator implements IResourceCoordinator {
  private cpuAvailable: number;
  private memoryMbAvailable: number;
  private gpuAvailable: number;
  private tokensAvailable: number;
  private rateWindowStartedAt = Date.now();
  private rateWindowCount = 0;
  private readonly leases = new Map<string, ResourceLease>();

  constructor(private readonly config: ConfigService) {
    this.cpuAvailable = config.execution.cpuUnits;
    this.memoryMbAvailable = config.execution.memoryMb;
    this.gpuAvailable = config.execution.gpuUnits;
    this.tokensAvailable = config.execution.tokenBudget;
  }

  reset(): void {
    this.cpuAvailable = this.config.execution.cpuUnits;
    this.memoryMbAvailable = this.config.execution.memoryMb;
    this.gpuAvailable = this.config.execution.gpuUnits;
    this.tokensAvailable = this.config.execution.tokenBudget;
    this.rateWindowStartedAt = Date.now();
    this.rateWindowCount = 0;
    this.leases.clear();
  }

  tryAcquire(task: ExecutableTask): ResourceLease | null {
    if (this.leases.has(task.id)) return null;
    if (!this.consumeRateSlot()) return null;

    const cpu = this.readCost(task.metadata.cpuCost, 1);
    const memoryMb = this.readCost(task.metadata.memoryMbCost, 64);
    const gpu = this.readCost(task.metadata.gpuCost, 0);
    const tokens = this.readCost(task.metadata.tokenCost, 10);

    if (
      cpu > this.cpuAvailable ||
      memoryMb > this.memoryMbAvailable ||
      gpu > this.gpuAvailable ||
      tokens > this.tokensAvailable
    ) {
      return null;
    }

    this.cpuAvailable -= cpu;
    this.memoryMbAvailable -= memoryMb;
    this.gpuAvailable -= gpu;
    this.tokensAvailable -= tokens;

    const lease = Object.freeze({
      taskId: task.id,
      cpu,
      memoryMb,
      gpu,
      tokens,
    });
    this.leases.set(task.id, lease);
    return lease;
  }

  release(lease: ResourceLease): void {
    if (!this.leases.has(lease.taskId)) return;
    this.cpuAvailable += lease.cpu;
    this.memoryMbAvailable += lease.memoryMb;
    this.gpuAvailable += lease.gpu;
    this.tokensAvailable += lease.tokens;
    this.leases.delete(lease.taskId);
  }

  snapshot(): ResourceSnapshot {
    return Object.freeze({
      cpuAvailable: this.cpuAvailable,
      memoryMbAvailable: this.memoryMbAvailable,
      gpuAvailable: this.gpuAvailable,
      tokensAvailable: this.tokensAvailable,
      activeLeases: this.leases.size,
    });
  }

  private consumeRateSlot(): boolean {
    const now = Date.now();
    if (now - this.rateWindowStartedAt >= 1000) {
      this.rateWindowStartedAt = now;
      this.rateWindowCount = 0;
    }
    if (this.rateWindowCount >= this.config.execution.rateLimitPerSec) {
      return false;
    }
    this.rateWindowCount += 1;
    return true;
  }

  private readCost(
    value: string | number | boolean | null | undefined,
    fallback: number,
  ): number {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value;
    }
    return fallback;
  }
}
