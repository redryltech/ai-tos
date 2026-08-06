import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IProviderAdapter } from '../adapters/provider.adapter';
import type { IInferenceExecutor } from '../contracts';
import type { ModelRequest, ModelResponse } from '../models/model.models';

/**
 * Inference Executor — executes only. No routing, no capability selection.
 */
@Injectable()
export class InferenceExecutor implements IInferenceExecutor {
  constructor(private readonly config: ConfigService) {}

  async execute(
    request: ModelRequest,
    adapter: IProviderAdapter,
  ): Promise<ModelResponse> {
    const timeoutMs =
      request.options?.timeoutMs ?? this.config.model.defaultTimeoutMs;

    if (request.options?.stream && !this.config.model.streamingEnabled) {
      return Object.freeze({
        requestId: request.requestId,
        providerId: request.providerId,
        modelId: request.modelId,
        status: 'failed',
        output: Object.freeze({ error: 'streaming_disabled' }),
        usage: Object.freeze({
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        }),
        metadata: Object.freeze({ executor: true }),
        duration: 0,
        traceId: request.traceId,
      });
    }

    return this.withTimeout(adapter.infer(request), timeoutMs, request);
  }

  private async withTimeout(
    promise: Promise<ModelResponse>,
    timeoutMs: number,
    request: ModelRequest,
  ): Promise<ModelResponse> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<ModelResponse>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`Model inference timed out after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Object.freeze({
        requestId: request.requestId,
        providerId: request.providerId,
        modelId: request.modelId,
        status: message.includes('timed out') ? 'timeout' : 'failed',
        output: Object.freeze({ error: message }),
        usage: Object.freeze({
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        }),
        metadata: Object.freeze({ executor: true }),
        duration: timeoutMs,
        traceId: request.traceId,
      });
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
