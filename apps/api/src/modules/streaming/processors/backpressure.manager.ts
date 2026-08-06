import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IBackpressureManager } from '../contracts';
import type { BackpressureDecision } from '../models/streaming.models';

/**
 * Backpressure Manager — control producer/consumer flow.
 */
@Injectable()
export class BackpressureManager implements IBackpressureManager {
  constructor(private readonly config: ConfigService) {}

  evaluate(bufferSize: number): BackpressureDecision {
    const high = this.config.streaming.backpressureHighWatermark;
    const low = this.config.streaming.backpressureLowWatermark;
    const max = this.config.streaming.maxBufferSize;
    const size = Math.max(0, bufferSize);

    if (size >= max || size >= high) {
      return Object.freeze({
        state: size >= max ? ('paused' as const) : ('throttled' as const),
        bufferSize: size,
        highWatermark: high,
        lowWatermark: low,
        accepted: size < max,
      });
    }

    return Object.freeze({
      state: 'ok' as const,
      bufferSize: size,
      highWatermark: high,
      lowWatermark: low,
      accepted: true,
    });
  }
}
