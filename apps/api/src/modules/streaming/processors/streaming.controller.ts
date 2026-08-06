import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import {
  BACKPRESSURE_MANAGER,
  EVENT_STREAM_MANAGER,
  OUTPUT_STREAM_MANAGER,
  PROGRESS_STREAM_MANAGER,
  STREAM_BUILDER,
  STREAM_PUBLISHER,
  SUBSCRIPTION_MANAGER,
  type IBackpressureManager,
  type IEventStreamManager,
  type IOutputStreamManager,
  type IProgressStreamManager,
  type IStreamBuilder,
  type IStreamPublisher,
  type IStreamingController,
  type ISubscriptionManager,
} from '../contracts';
import type { StreamExecutionDto } from '../dto/streaming.dto';
import type { ExecutionStream } from '../models/streaming.models';
import { StreamingError } from '../models/streaming.models';

/**
 * Streaming Controller — orchestrate streaming pipeline only.
 * Never executes, retries, recovers, or finalizes.
 */
@Injectable()
export class StreamingController implements IStreamingController {
  constructor(
    private readonly config: ConfigService,
    @Inject(EVENT_STREAM_MANAGER)
    private readonly eventManager: IEventStreamManager,
    @Inject(OUTPUT_STREAM_MANAGER)
    private readonly outputManager: IOutputStreamManager,
    @Inject(PROGRESS_STREAM_MANAGER)
    private readonly progressManager: IProgressStreamManager,
    @Inject(BACKPRESSURE_MANAGER)
    private readonly backpressureManager: IBackpressureManager,
    @Inject(SUBSCRIPTION_MANAGER)
    private readonly subscriptionManager: ISubscriptionManager,
    @Inject(STREAM_BUILDER) private readonly streamBuilder: IStreamBuilder,
    @Inject(STREAM_PUBLISHER) private readonly publisher: IStreamPublisher,
  ) {}

  async stream(
    dto: StreamExecutionDto | ExecutionProgress,
  ): Promise<ExecutionStream> {
    const progress = this.unwrap(dto);
    const events = this.eventManager.build(progress);
    const outputs = this.outputManager.build(progress);
    const progressSnapshot = this.progressManager.build(progress);
    const bufferSize = events.length + outputs.length + 1;
    const backpressure = this.backpressureManager.evaluate(bufferSize);

    if (!backpressure.accepted) {
      throw new StreamingError(
        `Stream backpressure paused: buffer ${backpressure.bufferSize} exceeds max`,
      );
    }

    const draft = this.streamBuilder.build({
      progress,
      events,
      outputs,
      progressSnapshot,
      backpressure,
      subscriberCount: 0,
      published: false,
      transportProvider: this.config.streaming.transportProvider,
    });

    this.subscriptionManager.register(draft.streamId, draft.workflowId);

    const stream = this.streamBuilder.build({
      progress,
      events,
      outputs,
      progressSnapshot,
      backpressure,
      subscriberCount: this.subscriptionManager.count(draft.streamId),
      published: false,
      transportProvider: this.config.streaming.transportProvider,
      streamId: draft.streamId,
    });

    return this.publisher.publish(stream);
  }

  private unwrap(
    dto: StreamExecutionDto | ExecutionProgress,
  ): ExecutionProgress {
    if (!dto || typeof dto !== 'object') {
      throw new StreamingError('ExecutionProgress is required');
    }
    if ('executionProgress' in dto) {
      if (!dto.executionProgress) {
        throw new StreamingError('ExecutionProgress is required');
      }
      return dto.executionProgress;
    }
    return dto;
  }
}
