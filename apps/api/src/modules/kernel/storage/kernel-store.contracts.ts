import type { RuntimeContext } from '../context.types';
import type { ExecutionRecord, ExecutionState } from '../execution-state.types';
import type { LifecyclePhase, LifecycleRecord } from '../lifecycle.types';
import type { ResourceReservation } from '../resource.types';
import type { KernelTask, TaskState } from '../task.types';

/** Injection tokens for kernel storage backends. */
export const TASK_STORE = Symbol('TASK_STORE');
export const CONTEXT_STORE = Symbol('CONTEXT_STORE');
export const STATE_STORE = Symbol('STATE_STORE');
export const RESOURCE_STORE = Symbol('RESOURCE_STORE');
export const LIFECYCLE_STORE = Symbol('LIFECYCLE_STORE');

/** Durable/task bag store for the Task Scheduler. */
export interface ITaskStore {
  nextSequence(): number;
  save(task: KernelTask): void;
  get(id: string): KernelTask | undefined;
  delete(id: string): boolean;
  values(): IterableIterator<KernelTask>;
  list(state?: TaskState): KernelTask[];
  size(): number;
  clear(): void;
}

/**
 * Async context propagation store.
 * Memory implementation wraps AsyncLocalStorage; behavior is process-local.
 */
export interface IContextStore {
  get(): RuntimeContext | undefined;
  run<T>(context: RuntimeContext, fn: () => T): T;
}

/** Execution state record store. */
export interface IStateStore {
  save(record: ExecutionRecord): void;
  get(id: string): ExecutionRecord | undefined;
  delete(id: string): boolean;
  values(): IterableIterator<ExecutionRecord>;
  list(state?: ExecutionState): ExecutionRecord[];
  size(): number;
  clear(): void;
}

/** Resource reservation store. */
export interface IResourceStore {
  save(reservation: ResourceReservation): void;
  get(id: string): ResourceReservation | undefined;
  delete(id: string): boolean;
  values(): IterableIterator<ResourceReservation>;
  list(ownerId?: string): ResourceReservation[];
  size(): number;
  clear(): void;
}

/** Lifecycle record store. */
export interface ILifecycleStore {
  save(record: LifecycleRecord): void;
  get(id: string): LifecycleRecord | undefined;
  delete(id: string): boolean;
  values(): IterableIterator<LifecycleRecord>;
  list(phase?: LifecyclePhase): LifecycleRecord[];
  size(): number;
  clear(): void;
}
