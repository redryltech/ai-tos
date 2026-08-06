import { Injectable } from '@nestjs/common';
import type { IUsageCollector } from '../contracts';
import type { UsageRecord } from '../models/model.models';

/**
 * Usage Collector — requests/tokens/duration/stats.
 * Never bills or optimizes.
 */
@Injectable()
export class UsageCollector implements IUsageCollector {
  private readonly records: UsageRecord[] = [];

  collect(record: UsageRecord): void {
    this.records.push(
      Object.freeze({
        requestId: record.requestId,
        providerId: record.providerId,
        modelId: record.modelId,
        usage: Object.freeze({ ...record.usage }),
        duration: record.duration,
        status: record.status,
        recordedAt: record.recordedAt,
      }),
    );
  }

  list(providerId?: string): readonly UsageRecord[] {
    const filtered = providerId
      ? this.records.filter((r) => r.providerId === providerId)
      : this.records;
    return Object.freeze([...filtered]);
  }

  totals(providerId?: string): {
    readonly requests: number;
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  } {
    const items = this.list(providerId);
    return Object.freeze({
      requests: items.length,
      promptTokens: items.reduce((s, r) => s + r.usage.promptTokens, 0),
      completionTokens: items.reduce((s, r) => s + r.usage.completionTokens, 0),
      totalTokens: items.reduce((s, r) => s + r.usage.totalTokens, 0),
    });
  }
}
