import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import {
  CAPABILITY_PROVIDER,
  CAPABILITY_REGISTRY,
  CAPABILITY_ROUTER,
  type ICapabilityOrchestrator,
  type ICapabilityProvider,
  type ICapabilityRegistry,
  type ICapabilityRouter,
} from '../contracts/capability.contracts';
import type {
  CapabilityImplementation,
  CapabilityName,
  CapabilityRequest,
  CapabilityResult,
} from '../models/capability.models';

/**
 * Capability Orchestrator — sequential/parallel pipelines, fallback, timeout, cancel.
 * Never reasons or calls concrete AI vendors; uses ICapabilityProvider only.
 */
@Injectable()
export class CapabilityOrchestrator implements ICapabilityOrchestrator {
  private readonly cancelled = new Set<string>();

  constructor(
    private readonly config: ConfigService,
    @Inject(CAPABILITY_ROUTER) private readonly router: ICapabilityRouter,
    @Inject(CAPABILITY_PROVIDER) private readonly provider: ICapabilityProvider,
    @Inject(CAPABILITY_REGISTRY) private readonly registry: ICapabilityRegistry,
  ) {}

  cancel(cancelToken: string): boolean {
    if (!cancelToken) return false;
    this.cancelled.add(cancelToken);
    return true;
  }

  async execute(request: CapabilityRequest): Promise<CapabilityResult> {
    const cancelToken = request.options?.cancelToken;
    if (cancelToken && this.cancelled.has(cancelToken)) {
      this.cancelled.delete(cancelToken);
      return this.terminal(request, 'cancelled', { reason: 'cancelled' }, 0);
    }

    const pipeline = request.options?.pipeline;
    if (pipeline && pipeline.length > 0) {
      if (request.options?.parallel) {
        return this.executeParallel(request, pipeline);
      }
      return this.executeSequential(request, pipeline);
    }

    return this.executeSingle(request);
  }

  private async executeSingle(request: CapabilityRequest): Promise<CapabilityResult> {
    const started = Date.now();
    const timeoutMs =
      request.constraints?.timeoutMs ?? this.config.capability.defaultTimeoutMs;
    const allowFallback =
      request.constraints?.allowFallback ?? this.config.capability.fallbackEnabled;

    try {
      const primary = this.router.route(
        request.capability,
        request.constraints?.preferredTier,
      );
      const result = await this.withTimeout(
        this.provider.execute(primary, request),
        timeoutMs,
        request,
      );
      if (result.status === 'completed') return result;

      if (allowFallback) {
        return this.tryFallback(request, primary, timeoutMs, started);
      }
      return result;
    } catch (err) {
      if (allowFallback) {
        try {
          const primary = this.router.route(
            request.capability,
            request.constraints?.preferredTier,
          );
          return await this.tryFallback(request, primary, timeoutMs, started);
        } catch {
          // fall through
        }
      }
      const message = err instanceof Error ? err.message : String(err);
      return this.terminal(
        request,
        message.includes('timed out') ? 'timeout' : 'failed',
        { error: message },
        Date.now() - started,
      );
    }
  }

  private async tryFallback(
    request: CapabilityRequest,
    failed: CapabilityImplementation,
    timeoutMs: number,
    started: number,
  ): Promise<CapabilityResult> {
    const alternatives = this.registry
      .list(request.capability)
      .filter((i) => i.available && i.id !== failed.id)
      .sort((a, b) => b.priority - a.priority);

    for (const alt of alternatives) {
      try {
        const result = await this.withTimeout(
          this.provider.execute(alt, request),
          timeoutMs,
          request,
        );
        if (result.status === 'completed') {
          return Object.freeze({
            ...result,
            metadata: Object.freeze({
              ...result.metadata,
              fallbackFrom: failed.id,
              fallbackUsed: true,
            }),
          });
        }
      } catch {
        continue;
      }
    }

    return this.terminal(
      request,
      'failed',
      { error: 'all_implementations_failed', failedId: failed.id },
      Date.now() - started,
    );
  }

  private async executeSequential(
    request: CapabilityRequest,
    pipeline: readonly CapabilityName[],
  ): Promise<CapabilityResult> {
    const started = Date.now();
    const outputs: Record<string, unknown>[] = [];
    let last: CapabilityResult | null = null;
    let carry: Readonly<Record<string, unknown>> = request.input;

    for (const capability of pipeline) {
      if (request.options?.cancelToken && this.cancelled.has(request.options.cancelToken)) {
        this.cancelled.delete(request.options.cancelToken);
        return this.terminal(request, 'cancelled', { reason: 'cancelled', outputs }, Date.now() - started);
      }
      const stepRequest: CapabilityRequest = Object.freeze({
        ...request,
        capability,
        input: carry,
        options: Object.freeze({
          ...request.options,
          pipeline: undefined,
          parallel: undefined,
        }),
      });
      last = await this.executeSingle(stepRequest);
      outputs.push(Object.freeze({ capability, ...last.output }));
      if (last.status !== 'completed') {
        return Object.freeze({
          ...last,
          capability: request.capability,
          duration: Date.now() - started,
          output: Object.freeze({ steps: outputs, failedAt: capability }),
        });
      }
      carry = Object.freeze({
        ...carry,
        ...last.output,
        text:
          typeof last.output.text === 'string'
            ? last.output.text
            : typeof last.output.translatedText === 'string'
              ? last.output.translatedText
              : carry.text,
      });
    }

    return Object.freeze({
      requestId: request.requestId,
      capability: request.capability,
      status: 'completed',
      output: Object.freeze({ steps: outputs, ...(last?.output ?? {}) }),
      metadata: Object.freeze({ mode: 'sequential', stepCount: pipeline.length }),
      duration: Date.now() - started,
      traceId: request.traceId,
    });
  }

  private async executeParallel(
    request: CapabilityRequest,
    pipeline: readonly CapabilityName[],
  ): Promise<CapabilityResult> {
    const started = Date.now();
    const max = this.config.capability.maxParallel;
    const caps = pipeline.slice(0, max);

    if (request.options?.cancelToken && this.cancelled.has(request.options.cancelToken)) {
      this.cancelled.delete(request.options.cancelToken);
      return this.terminal(request, 'cancelled', { reason: 'cancelled' }, 0);
    }

    const results = await Promise.all(
      caps.map(async (capability) => {
        const stepRequest: CapabilityRequest = Object.freeze({
          ...request,
          capability,
          options: Object.freeze({
            ...request.options,
            pipeline: undefined,
            parallel: undefined,
          }),
        });
        return this.executeSingle(stepRequest);
      }),
    );

    const failed = results.find((r) => r.status !== 'completed');
    return Object.freeze({
      requestId: request.requestId,
      capability: request.capability,
      status: failed ? failed.status : 'completed',
      output: Object.freeze({
        steps: results.map((r) =>
          Object.freeze({ capability: r.capability, status: r.status, output: r.output }),
        ),
      }),
      metadata: Object.freeze({ mode: 'parallel', stepCount: caps.length }),
      duration: Date.now() - started,
      traceId: request.traceId,
    });
  }

  private async withTimeout(
    promise: Promise<CapabilityResult>,
    timeoutMs: number,
    request: CapabilityRequest,
  ): Promise<CapabilityResult> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<CapabilityResult>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`Capability timed out after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
      if (request.options?.cancelToken) {
        this.cancelled.delete(request.options.cancelToken);
      }
    }
  }

  private terminal(
    request: CapabilityRequest,
    status: CapabilityResult['status'],
    output: Record<string, unknown>,
    duration: number,
  ): CapabilityResult {
    return Object.freeze({
      requestId: request.requestId,
      capability: request.capability,
      status,
      output: Object.freeze(output),
      metadata: Object.freeze({ terminal: true }),
      duration,
      traceId: request.traceId,
    });
  }
}
