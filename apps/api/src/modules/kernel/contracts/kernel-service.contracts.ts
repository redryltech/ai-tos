import type {
  BroadcastInput,
  CommEndpoint,
  CommEndpointKind,
  CommMessage,
  CommMessageHandler,
  CommunicationStats,
  RequestInput,
  SendMessageInput,
} from '../communication.types';
import type {
  OrganizationContext,
  PipelineContext,
  RequestContext,
  RuntimeContext,
  UserContext,
  WorkerContext,
} from '../context.types';
import type {
  CreateExecutionInput,
  ExecutionRecord,
  ExecutionState,
  StateManagerStats,
  TransitionOptions,
} from '../execution-state.types';
import type {
  CreateLifecycleInput,
  LifecycleActionOptions,
  LifecycleManagerStats,
  LifecyclePhase,
  LifecycleRecord,
} from '../lifecycle.types';
import type {
  ModelAllocation,
  ReserveResourcesInput,
  ResourceAvailability,
  ResourceLimits,
  ResourceManagerStats,
  ResourceReservation,
  ResourceUsage,
  WorkerAllocation,
} from '../resource.types';
import type {
  CreateTaskInput,
  KernelTask,
  TaskHandler,
  TaskSchedulerStats,
  TaskState,
} from '../task.types';

/** Injection tokens for kernel service contracts. */
export const TASK_SCHEDULER = Symbol('TASK_SCHEDULER');
export const CONTEXT_MANAGER = Symbol('CONTEXT_MANAGER');
export const STATE_MANAGER = Symbol('STATE_MANAGER');
export const RESOURCE_MANAGER = Symbol('RESOURCE_MANAGER');
export const LIFECYCLE_MANAGER = Symbol('LIFECYCLE_MANAGER');
export const COMMUNICATION_MANAGER = Symbol('COMMUNICATION_MANAGER');

export interface ITaskScheduler {
  registerHandler(type: string, handler: TaskHandler): void;
  unregisterHandler(type: string): boolean;
  createTask<TPayload = unknown>(input: CreateTaskInput<TPayload>): KernelTask<TPayload>;
  getTask(taskId: string): KernelTask | null;
  listTasks(state?: TaskState): KernelTask[];
  cancelTask(taskId: string): boolean;
  getStats(): TaskSchedulerStats;
  tick(): Promise<void>;
}

export interface IContextManager {
  readonly isEnabled: boolean;
  getContext(): RuntimeContext;
  getRequest(): RequestContext | undefined;
  getUser(): UserContext | undefined;
  getOrganization(): OrganizationContext | undefined;
  getPipeline(): PipelineContext | undefined;
  getWorker(): WorkerContext | undefined;
  runWithContext<T>(partial: Partial<RuntimeContext>, fn: () => T): T;
  setContext(partial: Partial<RuntimeContext>): void;
  setRequest(request: RequestContext): void;
  setUser(user: UserContext): void;
  setOrganization(organization: OrganizationContext): void;
  setPipeline(pipeline: PipelineContext): void;
  setWorker(worker: WorkerContext): void;
  setAttribute(key: string, value: string | number | boolean): void;
  fork(extra?: Partial<RuntimeContext>): RuntimeContext;
  ensureRequest(partial?: Partial<RequestContext>): RequestContext;
}

export interface IStateManager {
  readonly isEnabled: boolean;
  create(input: CreateExecutionInput): ExecutionRecord;
  get(id: string): ExecutionRecord | undefined;
  list(state?: ExecutionState): ExecutionRecord[];
  stats(): StateManagerStats;
  transition(id: string, to: ExecutionState, options?: TransitionOptions): ExecutionRecord;
  schedule(id: string, options?: TransitionOptions): ExecutionRecord;
  start(id: string, options?: TransitionOptions): ExecutionRecord;
  wait(id: string, options?: TransitionOptions): ExecutionRecord;
  complete(id: string, options?: TransitionOptions): ExecutionRecord;
  fail(id: string, options?: TransitionOptions): ExecutionRecord;
  cancel(id: string, options?: TransitionOptions): ExecutionRecord;
  remove(id: string): boolean;
  clear(): void;
}

export interface IResourceManager {
  readonly isEnabled: boolean;
  getLimits(): ResourceLimits;
  getUsage(): ResourceUsage;
  getAvailable(): ResourceAvailability;
  stats(): ResourceManagerStats;
  getReservation(id: string): ResourceReservation | undefined;
  listReservations(ownerId?: string): ResourceReservation[];
  reserve(input: ReserveResourcesInput): ResourceReservation;
  tryReserve(input: ReserveResourcesInput): ResourceReservation | null;
  release(reservationId: string): boolean;
  releaseAll(ownerId: string): number;
  allocateWorker(ownerId: string, workerId?: string): WorkerAllocation;
  allocateModel(ownerId: string, modelId: string, slots?: number): ModelAllocation;
  clear(): void;
}

export interface ILifecycleManager {
  readonly isEnabled: boolean;
  register(input: CreateLifecycleInput): LifecycleRecord;
  get(id: string): LifecycleRecord | undefined;
  list(phase?: LifecyclePhase): LifecycleRecord[];
  stats(): LifecycleManagerStats;
  start(id: string, options?: LifecycleActionOptions): LifecycleRecord;
  pause(id: string, options?: LifecycleActionOptions): LifecycleRecord;
  resume(id: string, options?: LifecycleActionOptions): LifecycleRecord;
  stop(id: string, options?: LifecycleActionOptions): LifecycleRecord;
  cancel(id: string, options?: LifecycleActionOptions): LifecycleRecord;
  complete(id: string, options?: LifecycleActionOptions): LifecycleRecord;
  remove(id: string): boolean;
  clear(): void;
}

export interface ICommunicationManager {
  readonly isEnabled: boolean;
  registerEndpoint(kind: CommEndpointKind, name: string, id?: string): CommEndpoint;
  unregisterEndpoint(id: string): boolean;
  getEndpoint(id: string): CommEndpoint | undefined;
  listEndpoints(kind?: CommEndpointKind): CommEndpoint[];
  subscribe(channel: string, handler: CommMessageHandler): () => void;
  send<TPayload = unknown>(input: SendMessageInput<TPayload>): Promise<CommMessage<TPayload>>;
  sendToService<TPayload = unknown>(
    input: SendMessageInput<TPayload>,
  ): Promise<CommMessage<TPayload>>;
  sendToWorker<TPayload = unknown>(
    input: SendMessageInput<TPayload>,
  ): Promise<CommMessage<TPayload>>;
  broadcast<TPayload = unknown>(
    input: BroadcastInput<TPayload>,
  ): Promise<CommMessage<TPayload>[]>;
  request<TRequest = unknown, TResponse = unknown>(
    input: RequestInput<TRequest>,
  ): Promise<CommMessage<TResponse>>;
  respond(
    from: string,
    to: string,
    channel: string,
    correlationId: string,
    payload: unknown,
  ): Promise<CommMessage>;
  stats(): CommunicationStats;
  clear(): void;
}
