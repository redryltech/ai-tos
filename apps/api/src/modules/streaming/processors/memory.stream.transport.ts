import { Injectable } from '@nestjs/common';
import type { IStreamTransport } from '../contracts';
import type { ExecutionStream } from '../models/streaming.models';

/**
 * Memory stream transport — abstract provider; no WebSocket/SSE/Kafka SDKs.
 */
@Injectable()
export class MemoryStreamTransport implements IStreamTransport {
  readonly provider = 'memory';
  private readonly published: ExecutionStream[] = [];

  async publish(
    stream: ExecutionStream,
    _topics: readonly string[],
  ): Promise<void> {
    this.published.push(stream);
    await Promise.resolve();
  }

  /** Test/helper — last published stream. */
  last(): ExecutionStream | undefined {
    return this.published[this.published.length - 1];
  }
}
