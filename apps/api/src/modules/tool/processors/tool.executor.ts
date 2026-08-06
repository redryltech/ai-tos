import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IToolAdapter } from '../adapters/tool.adapter';
import type { IToolExecutor } from '../contracts';
import type { ToolRequest, ToolResult } from '../models/tool.models';

/**
 * Tool Executor — deterministic execution only.
 * Never reasons, never infers, never connects to SaaS.
 */
@Injectable()
export class ToolExecutor implements IToolExecutor {
  private readonly cancelled = new Set<string>();

  constructor(private readonly config: ConfigService) {}

  cancel(cancelToken: string): boolean {
    if (!cancelToken) return false;
    this.cancelled.add(cancelToken);
    return true;
  }

  async execute(
    request: ToolRequest,
    adapter: IToolAdapter,
  ): Promise<ToolResult> {
    const cancelToken = request.options?.cancelToken;
    if (cancelToken && this.cancelled.has(cancelToken)) {
      this.cancelled.delete(cancelToken);
      return this.terminal(request, 'cancelled', { reason: 'cancelled' }, 0);
    }

    const timeoutMs =
      request.constraints?.timeoutMs ??
      adapter.descriptor().timeoutMs ??
      this.config.tool.defaultTimeoutMs;

    if (
      (request.options?.stream || request.options?.mode === 'stream') &&
      !this.config.tool.streamingEnabled
    ) {
      return this.terminal(request, 'failed', { error: 'streaming_disabled' }, 0);
    }

    return this.withTimeout(adapter.execute(request), timeoutMs, request);
  }

  private async withTimeout(
    promise: Promise<ToolResult>,
    timeoutMs: number,
    request: ToolRequest,
  ): Promise<ToolResult> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<ToolResult>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`Tool timed out after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return this.terminal(
        request,
        message.includes('timed out') ? 'timeout' : 'failed',
        { error: message },
        timeoutMs,
      );
    } finally {
      if (timer) clearTimeout(timer);
      if (request.options?.cancelToken) {
        this.cancelled.delete(request.options.cancelToken);
      }
    }
  }

  private terminal(
    request: ToolRequest,
    status: ToolResult['status'],
    output: Record<string, unknown>,
    duration: number,
  ): ToolResult {
    return Object.freeze({
      requestId: request.requestId,
      toolId: request.toolId,
      status,
      output: Object.freeze(output),
      metadata: Object.freeze({ executor: true }),
      duration,
      traceId: request.traceId,
    });
  }
}
