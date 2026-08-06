import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { ICheckpointManager } from '../contracts';
import type { CheckpointRecord } from '../models/reliability.models';

/**
 * Checkpoint Manager — create/restore recovery snapshots (in-memory provider).
 * Never executes tasks. Provider-independent interface.
 */
@Injectable()
export class CheckpointManager implements ICheckpointManager {
  private readonly store = new Map<string, CheckpointRecord>();

  create(progress: ExecutionProgress): CheckpointRecord {
    const record = Object.freeze({
      id: randomUUID(),
      workflowId: progress.workflowId,
      progressPercentage: progress.progressPercentage,
      completedTaskIds: Object.freeze([
        ...(progress.metadata.completedTaskIds ?? []),
      ]),
      failedTaskIds: Object.freeze([...(progress.metadata.failedTaskIds ?? [])]),
      createdAt: new Date().toISOString(),
    });
    this.store.set(record.id, record);
    return record;
  }

  restore(checkpointId: string): CheckpointRecord | null {
    return this.store.get(checkpointId) ?? null;
  }
}
