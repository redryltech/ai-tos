import type { ExecutionProgress } from '../../parallel-executor/models/execution.models';
import type {
  BackpressureDecision,
  ExecutionStream,
  StreamEvent,
  StreamOutput,
  StreamProgressSnapshot,
  StreamSubscription,
} from '../models/streaming.models';

export const STREAMING_SERVICE = Symbol('STREAMING_SERVICE');
export const STREAMING_CONTROLLER = Symbol('STREAMING_CONTROLLER');
export const STREAM_BUILDER = Symbol('STREAM_BUILDER');
export const EVENT_STREAM_MANAGER = Symbol('EVENT_STREAM_MANAGER');
export const OUTPUT_STREAM_MANAGER = Symbol('OUTPUT_STREAM_MANAGER');
export const PROGRESS_STREAM_MANAGER = Symbol('PROGRESS_STREAM_MANAGER');
export const BACKPRESSURE_MANAGER = Symbol('BACKPRESSURE_MANAGER');
export const SUBSCRIPTION_MANAGER = Symbol('SUBSCRIPTION_MANAGER');
export const STREAM_PUBLISHER = Symbol('STREAM_PUBLISHER');
export const STREAM_TRANSPORT = Symbol('STREAM_TRANSPORT');

export interface IEventStreamManager {
  build(progress: ExecutionProgress): readonly StreamEvent[];
}

export interface IOutputStreamManager {
  build(progress: ExecutionProgress): readonly StreamOutput[];
}

export interface IProgressStreamManager {
  build(progress: ExecutionProgress): StreamProgressSnapshot;
}

export interface IBackpressureManager {
  evaluate(bufferSize: number): BackpressureDecision;
}

export interface ISubscriptionManager {
  register(streamId: string, workflowId: string): StreamSubscription;
  unregister(subscriptionId: string): boolean;
  count(streamId?: string): number;
  list(streamId: string): readonly StreamSubscription[];
}

export interface IStreamTransport {
  readonly provider: string;
  publish(
    stream: ExecutionStream,
    topics: readonly string[],
  ): Promise<void>;
}

export interface IStreamPublisher {
  publish(stream: ExecutionStream): Promise<ExecutionStream>;
}

export interface IStreamBuilder {
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
  }): ExecutionStream;
}

export interface IStreamingController {
  stream(progress: ExecutionProgress): Promise<ExecutionStream>;
}

/** Sole public Streaming Engine contract. */
export interface IStreamingService {
  stream(executionProgress: ExecutionProgress): Promise<ExecutionStream>;
}
