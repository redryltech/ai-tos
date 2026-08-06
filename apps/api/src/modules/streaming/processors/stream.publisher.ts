import { Inject, Injectable } from '@nestjs/common';
import {
  STREAM_TRANSPORT,
  type IStreamPublisher,
  type IStreamTransport,
} from '../contracts';
import type { ExecutionStream } from '../models/streaming.models';
import { StreamingError } from '../models/streaming.models';

/**
 * Stream Publisher — publish through abstract transport.
 * Never binds to WebSocket/SSE/Kafka directly.
 */
@Injectable()
export class StreamPublisher implements IStreamPublisher {
  constructor(
    @Inject(STREAM_TRANSPORT) private readonly transport: IStreamTransport,
  ) {}

  async publish(stream: ExecutionStream): Promise<ExecutionStream> {
    if (!stream?.streamId) {
      throw new StreamingError('ExecutionStream.streamId is required');
    }
    const topics = Object.freeze([
      `stream.${stream.workflowId}.events`,
      `stream.${stream.workflowId}.outputs`,
      `stream.${stream.workflowId}.progress`,
    ]);
    await this.transport.publish(stream, topics);
    return Object.freeze({
      ...stream,
      metadata: Object.freeze({
        ...stream.metadata,
        published: true,
        transportProvider: this.transport.provider,
        extras: Object.freeze({
          ...stream.metadata.extras,
          topicCount: topics.length,
        }),
      }),
    });
  }
}
