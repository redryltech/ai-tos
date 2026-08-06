import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { IOutputStreamManager } from '../contracts';
import type { StreamOutput } from '../models/streaming.models';

/**
 * Output Stream Manager — publish incremental outputs.
 * Never executes or calls Layer 4.
 */
@Injectable()
export class OutputStreamManager implements IOutputStreamManager {
  build(progress: ExecutionProgress): readonly StreamOutput[] {
    const now = new Date().toISOString();
    const extras = progress.metadata.extras ?? {};
    const outputs: StreamOutput[] = [];

    const explicit =
      typeof extras.outputChunk === 'string' ? extras.outputChunk : null;
    if (explicit) {
      outputs.push(
        Object.freeze({
          id: randomUUID(),
          sequence: 0,
          content: explicit,
          mimeType:
            typeof extras.outputMimeType === 'string'
              ? extras.outputMimeType
              : 'text/plain',
          timestamp: now,
        }),
      );
    }

    outputs.push(
      Object.freeze({
        id: randomUUID(),
        sequence: outputs.length,
        content: JSON.stringify({
          workflowId: progress.workflowId,
          progressPercentage: progress.progressPercentage,
          completedTasks: progress.completedTasks,
          failedTasks: progress.failedTasks,
        }),
        mimeType: 'application/json',
        timestamp: now,
      }),
    );

    return Object.freeze(outputs);
  }
}
