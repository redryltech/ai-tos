import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type { IStreamBuilder } from '../contracts';
import type {
  BackpressureDecision,
  ExecutionStream,
  StreamEvent,
  StreamOutput,
  StreamProgressSnapshot,
} from '../models/streaming.models';

/**
 * Stream Builder — assemble immutable ExecutionStream.
 */
@Injectable()
export class StreamBuilder implements IStreamBuilder {
  build(input: {
    progress: ExecutionProgress;
    events: readonly StreamEvent[];
    outputs: readonly StreamOutput[];
    progressSnapshot: StreamProgressSnapshot;
    backpressure: BackpressureDecision;
    subscriberCount: number;
    published: boolean;
    transportProvider: string;
    streamId?: string;
  }): ExecutionStream {
    return Object.freeze({
      streamId: input.streamId ?? randomUUID(),
      workflowId: input.progress.workflowId,
      events: Object.freeze([...input.events]),
      outputs: Object.freeze([...input.outputs]),
      progress: input.progressSnapshot,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        backpressureState: input.backpressure.state,
        subscriberCount: input.subscriberCount,
        transportProvider: input.transportProvider,
        published: input.published,
        extras: Object.freeze({
          bufferSize: input.backpressure.bufferSize,
          accepted: input.backpressure.accepted,
          eventCount: input.events.length,
          outputCount: input.outputs.length,
          progressPercentage: input.progressSnapshot.progressPercentage,
        }),
      }),
      traceId: input.progress.traceId,
      timestamp: new Date().toISOString(),
    });
  }
}
