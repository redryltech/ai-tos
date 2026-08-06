import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutableTask } from '../../task-manager/models/task.models';
import type { IConcurrencyCoordinator } from '../contracts';

/**
 * Concurrency Coordinator — limit parallelism by strategy/config.
 * Never executes tasks.
 */
@Injectable()
export class ConcurrencyCoordinator implements IConcurrencyCoordinator {
  constructor(private readonly config: ConfigService) {}

  selectBatch(
    ready: readonly ExecutableTask[],
    runningCount: number,
  ): readonly ExecutableTask[] {
    const limit = Math.max(1, this.config.execution.maxConcurrency);
    const slots = Math.max(0, limit - runningCount);
    if (slots === 0 || ready.length === 0) {
      return Object.freeze([]);
    }

    const strategy =
      typeof ready[0]?.metadata.strategyKind === 'string'
        ? ready[0].metadata.strategyKind
        : 'hybrid';

    if (strategy === 'sequential') {
      return Object.freeze(ready.slice(0, Math.min(1, slots)));
    }

    return Object.freeze(ready.slice(0, slots));
  }
}
