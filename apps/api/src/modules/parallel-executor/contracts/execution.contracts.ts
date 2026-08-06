import type { ExecutableTask } from '../../task-manager/models/task.models';
import type { ExecutableTaskCollection } from '../../task-manager/models/task.models';
import type {
  ExecutionProgress,
  ExecutionSnapshot,
  ResourceLease,
  ResourceSnapshot,
  WorkerResult,
} from '../models/execution.models';

export const PARALLEL_EXECUTOR_SERVICE = Symbol('PARALLEL_EXECUTOR_SERVICE');
export const EXECUTION_CONTROLLER = Symbol('EXECUTION_CONTROLLER');
export const DEPENDENCY_RESOLVER = Symbol('DEPENDENCY_RESOLVER');
export const CONCURRENCY_COORDINATOR = Symbol('CONCURRENCY_COORDINATOR');
export const WORKER_DISPATCHER = Symbol('WORKER_DISPATCHER');
export const RESOURCE_COORDINATOR = Symbol('RESOURCE_COORDINATOR');
export const EXECUTION_MONITOR = Symbol('EXECUTION_MONITOR');
export const PROGRESS_PUBLISHER = Symbol('PROGRESS_PUBLISHER');
export const WORKER_ADAPTER = Symbol('WORKER_ADAPTER');

export interface IDependencyResolver {
  resolveReady(
    collection: ExecutableTaskCollection,
    completedIds: ReadonlySet<string>,
    failedIds: ReadonlySet<string>,
    runningIds: ReadonlySet<string>,
  ): readonly ExecutableTask[];
}

export interface IConcurrencyCoordinator {
  selectBatch(
    ready: readonly ExecutableTask[],
    runningCount: number,
  ): readonly ExecutableTask[];
}

export interface IWorkerAdapter {
  readonly provider: string;
  run(task: ExecutableTask): Promise<WorkerResult>;
}

export interface IWorkerDispatcher {
  dispatch(tasks: readonly ExecutableTask[]): Promise<readonly WorkerResult[]>;
}

export interface IResourceCoordinator {
  tryAcquire(task: ExecutableTask): ResourceLease | null;
  release(lease: ResourceLease): void;
  snapshot(): ResourceSnapshot;
  reset(): void;
}

export interface IExecutionMonitor {
  create(collection: ExecutableTaskCollection): ExecutionSnapshot;
  markRunning(snapshot: ExecutionSnapshot, taskIds: readonly string[]): ExecutionSnapshot;
  markCompleted(snapshot: ExecutionSnapshot, taskId: string): ExecutionSnapshot;
  markFailed(
    snapshot: ExecutionSnapshot,
    taskId: string,
    error?: string,
  ): ExecutionSnapshot;
}

export interface IProgressPublisher {
  publish(
    snapshot: ExecutionSnapshot,
    collection: ExecutableTaskCollection,
    extras?: Readonly<Record<string, string | number | boolean | null>>,
  ): ExecutionProgress;
}

export interface IExecutionController {
  execute(
    collection: ExecutableTaskCollection,
  ): Promise<ExecutionProgress>;
}

/** Sole public Parallel Executor contract. */
export interface IParallelExecutorService {
  execute(
    executableTaskCollection: ExecutableTaskCollection,
  ): Promise<ExecutionProgress>;
}
