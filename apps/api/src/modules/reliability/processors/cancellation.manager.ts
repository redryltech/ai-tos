import { Injectable } from '@nestjs/common';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { ICancellationManager } from '../contracts';
import type { CancellationDecision } from '../models/reliability.models';

/**
 * Cancellation Manager — decide graceful/user/system cancellation.
 * Never executes tasks.
 */
@Injectable()
export class CancellationManager implements ICancellationManager {
  decide(progress: ExecutionProgress): CancellationDecision {
    const extras = progress.metadata.extras ?? {};
    if (extras.userCancelled === true) {
      return Object.freeze({
        cancelled: true,
        mode: 'user' as const,
        reason: 'User cancellation requested',
      });
    }
    if (extras.systemCancelled === true) {
      return Object.freeze({
        cancelled: true,
        mode: 'system' as const,
        reason: 'System cancellation requested',
      });
    }
    if ((progress.metadata.cancelledTasks ?? 0) > 0 || extras.gracefulCancel === true) {
      return Object.freeze({
        cancelled: true,
        mode: 'graceful' as const,
        reason: 'Graceful cancellation indicated',
      });
    }
    return Object.freeze({
      cancelled: false,
      mode: 'none' as const,
    });
  }
}
