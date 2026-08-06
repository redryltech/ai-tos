import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import type {
  OrganizationContext,
  PipelineContext,
  RequestContext,
  RuntimeContext,
  UserContext,
  WorkerContext,
} from './context.types';
import type { IContextStore } from './storage/kernel-store.contracts';
import { CONTEXT_STORE } from './storage/kernel-store.contracts';
import type { IContextManager } from './contracts/kernel-service.contracts';

function mergeContext(base: RuntimeContext, patch: Partial<RuntimeContext>): RuntimeContext {
  return {
    request: patch.request ? { ...base.request, ...patch.request } as RequestContext : base.request,
    user: patch.user ? { ...base.user, ...patch.user } as UserContext : base.user,
    organization: patch.organization
      ? { ...base.organization, ...patch.organization } as OrganizationContext
      : base.organization,
    pipeline: patch.pipeline
      ? { ...base.pipeline, ...patch.pipeline } as PipelineContext
      : base.pipeline,
    worker: patch.worker ? { ...base.worker, ...patch.worker } as WorkerContext : base.worker,
    attributes: patch.attributes
      ? { ...(base.attributes ?? {}), ...patch.attributes }
      : base.attributes,
  };
}

/**
 * Centralized runtime context manager (Phase 2.2.2).
 * Request / user / org / pipeline / worker contexts with ALS propagation via IContextStore.
 */
@Injectable()
export class ContextManagerService implements IContextManager {
  constructor(
    private readonly config: ConfigService,
    private readonly eventBus: EventBusService,
    @Inject(CONTEXT_STORE) private readonly contextStore: IContextStore,
  ) {}

  get isEnabled(): boolean {
    return this.config.kernel.contextEnabled;
  }

  getContext(): RuntimeContext {
    return { ...(this.contextStore.get() ?? {}) };
  }

  getRequest(): RequestContext | undefined {
    return this.getContext().request;
  }

  getUser(): UserContext | undefined {
    return this.getContext().user;
  }

  getOrganization(): OrganizationContext | undefined {
    return this.getContext().organization;
  }

  getPipeline(): PipelineContext | undefined {
    return this.getContext().pipeline;
  }

  getWorker(): WorkerContext | undefined {
    return this.getContext().worker;
  }

  runWithContext<T>(partial: Partial<RuntimeContext>, fn: () => T): T {
    if (!this.config.kernel.contextEnabled) {
      return fn();
    }
    const parent = this.contextStore.get() ?? {};
    const next = mergeContext(parent, partial);
    return this.contextStore.run(next, () => {
      void this.emitBound('kernel.context.bound', next);
      return fn();
    });
  }

  setContext(partial: Partial<RuntimeContext>): void {
    if (!this.config.kernel.contextEnabled) return;
    const store = this.contextStore.get();
    if (!store) return;
    const merged = mergeContext(store, partial);
    Object.assign(store, merged);
    void this.emitBound('kernel.context.updated', store);
  }

  setRequest(request: RequestContext): void {
    this.setContext({ request });
  }

  setUser(user: UserContext): void {
    this.setContext({ user });
  }

  setOrganization(organization: OrganizationContext): void {
    this.setContext({ organization });
  }

  setPipeline(pipeline: PipelineContext): void {
    this.setContext({ pipeline });
  }

  setWorker(worker: WorkerContext): void {
    this.setContext({ worker });
  }

  setAttribute(key: string, value: string | number | boolean): void {
    this.setContext({ attributes: { [key]: value } });
  }

  fork(extra: Partial<RuntimeContext> = {}): RuntimeContext {
    return mergeContext(this.getContext(), extra);
  }

  ensureRequest(partial: Partial<RequestContext> = {}): RequestContext {
    const existing = this.getRequest();
    const request: RequestContext = {
      requestId: partial.requestId ?? existing?.requestId ?? randomUUID(),
      correlationId: partial.correlationId ?? existing?.correlationId,
      path: partial.path ?? existing?.path,
      method: partial.method ?? existing?.method,
      startedAt: partial.startedAt ?? existing?.startedAt ?? new Date().toISOString(),
    };
    this.setRequest(request);
    return request;
  }

  private async emitBound(topic: string, context: RuntimeContext): Promise<void> {
    if (!this.config.kernel.contextEmitEvents) return;
    await this.eventBus.publish(
      topic,
      {
        requestId: context.request?.requestId,
        userId: context.user?.userId,
        organizationId: context.organization?.organizationId,
        pipelineId: context.pipeline?.pipelineId,
        workerId: context.worker?.workerId,
      },
      {
        correlationId: context.request?.correlationId,
        organizationId: context.organization?.organizationId,
        userId: context.user?.userId,
        source: 'ai-kernel',
      },
    );
  }
}
