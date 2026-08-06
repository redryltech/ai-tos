import { Injectable } from '@nestjs/common';
import type { ExecutableTask } from '../../task-manager/models/task.models';
import type { IWorkerAdapter } from '../contracts';
import type { WorkerResult } from '../models/execution.models';

/**
 * Local/stub worker adapter — deterministic task completion.
 * Never calls Layer 4 services (model/tool/integration/capability).
 */
@Injectable()
export class LocalWorkerAdapter implements IWorkerAdapter {
  readonly provider = 'local';

  async run(task: ExecutableTask): Promise<WorkerResult> {
    const started = Date.now();
    const forceFail = task.metadata.forceFail === true;
    await Promise.resolve();
    return Object.freeze({
      taskId: task.id,
      success: !forceFail,
      durationMs: Math.max(0, Date.now() - started),
      error: forceFail ? 'Forced task failure' : undefined,
      resourceUnits: Object.freeze({
        cpu: 1,
        memoryMb: 64,
        gpu: 0,
        tokens: 10,
      }),
    });
  }
}
