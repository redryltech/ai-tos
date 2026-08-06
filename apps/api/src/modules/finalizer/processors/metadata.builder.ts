import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IMetadataBuilder } from '../contracts';
import type {
  CompletedExecution,
  ExecutionResultMetadata,
} from '../models/finalizer.models';

/**
 * Metadata Builder — immutable finalization metadata.
 */
@Injectable()
export class MetadataBuilder implements IMetadataBuilder {
  constructor(private readonly config: ConfigService) {}

  build(completed: CompletedExecution): ExecutionResultMetadata {
    return Object.freeze({
      workflowId: completed.workflowId,
      traceId: completed.traceId,
      startedAt: completed.startedAt,
      endedAt: completed.endedAt,
      version: completed.version ?? this.config.finalization.schemaVersion,
      schemaVersion: this.config.finalization.schemaVersion,
      extras: Object.freeze({ ...(completed.extras ?? {}) }),
    });
  }
}
