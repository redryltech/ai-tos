import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { ITimeoutManager } from '../contracts';
import type { TimeoutAssessment } from '../models/reliability.models';

/**
 * Timeout Manager — assess execution/heartbeat/idle timeouts.
 * Never executes tasks.
 */
@Injectable()
export class TimeoutManager implements ITimeoutManager {
  constructor(private readonly config: ConfigService) {}

  assess(progress: ExecutionProgress): TimeoutAssessment {
    const extras = progress.metadata.extras ?? {};
    const now = Date.now();
    const startedAt = this.readTime(extras.startedAt, progress.timestamp);
    const lastHeartbeatAt = this.readTime(
      extras.lastHeartbeatAt,
      progress.timestamp,
    );
    const lastActivityAt = this.readTime(
      extras.lastActivityAt,
      progress.timestamp,
    );

    const executionTimedOut =
      extras.executionTimedOut === true ||
      now - startedAt > this.config.reliability.executionTimeoutMs;
    const heartbeatTimedOut =
      extras.heartbeatTimedOut === true ||
      (progress.runningTasks > 0 &&
        now - lastHeartbeatAt > this.config.reliability.heartbeatTimeoutMs);
    const idleTimedOut =
      extras.idleTimedOut === true ||
      (progress.runningTasks === 0 &&
        progress.pendingTasks > 0 &&
        now - lastActivityAt > this.config.reliability.idleTimeoutMs);

    let reason: string | undefined;
    if (executionTimedOut) reason = 'Execution timeout exceeded';
    else if (heartbeatTimedOut) reason = 'Heartbeat timeout exceeded';
    else if (idleTimedOut) reason = 'Idle timeout exceeded';

    return Object.freeze({
      executionTimedOut,
      heartbeatTimedOut,
      idleTimedOut,
      reason,
    });
  }

  private readTime(
    value: string | number | boolean | null | undefined,
    fallbackIso: string,
  ): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    const fallback = Date.parse(fallbackIso);
    return Number.isNaN(fallback) ? Date.now() : fallback;
  }
}
