import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  BACKPRESSURE_MANAGER,
  EVENT_STREAM_MANAGER,
  OUTPUT_STREAM_MANAGER,
  PROGRESS_STREAM_MANAGER,
  STREAM_BUILDER,
  STREAM_PUBLISHER,
  STREAM_TRANSPORT,
  STREAMING_CONTROLLER,
  STREAMING_SERVICE,
  SUBSCRIPTION_MANAGER,
} from './contracts';
import { BackpressureManager } from './processors/backpressure.manager';
import { EventStreamManager } from './processors/event.stream.manager';
import { MemoryStreamTransport } from './processors/memory.stream.transport';
import { OutputStreamManager } from './processors/output.stream.manager';
import { ProgressStreamManager } from './processors/progress.stream.manager';
import { StreamBuilder } from './processors/stream.builder';
import { StreamPublisher } from './processors/stream.publisher';
import { StreamingController } from './processors/streaming.controller';
import { SubscriptionManager } from './processors/subscription.manager';
import { StreamingService } from './streaming.service';

/**
 * Streaming Engine (Layer 5.5).
 * Public API: STREAMING_SERVICE → IStreamingService.stream()
 */
@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    MetricsModule,
    EventBusModule,
    HealthModule,
  ],
  providers: [
    EventStreamManager,
    OutputStreamManager,
    ProgressStreamManager,
    BackpressureManager,
    SubscriptionManager,
    MemoryStreamTransport,
    StreamPublisher,
    StreamBuilder,
    StreamingController,
    StreamingService,
    { provide: EVENT_STREAM_MANAGER, useExisting: EventStreamManager },
    { provide: OUTPUT_STREAM_MANAGER, useExisting: OutputStreamManager },
    { provide: PROGRESS_STREAM_MANAGER, useExisting: ProgressStreamManager },
    { provide: BACKPRESSURE_MANAGER, useExisting: BackpressureManager },
    { provide: SUBSCRIPTION_MANAGER, useExisting: SubscriptionManager },
    { provide: STREAM_TRANSPORT, useExisting: MemoryStreamTransport },
    { provide: STREAM_PUBLISHER, useExisting: StreamPublisher },
    { provide: STREAM_BUILDER, useExisting: StreamBuilder },
    { provide: STREAMING_CONTROLLER, useExisting: StreamingController },
    { provide: STREAMING_SERVICE, useExisting: StreamingService },
  ],
  exports: [STREAMING_SERVICE],
})
export class StreamingModule {}
