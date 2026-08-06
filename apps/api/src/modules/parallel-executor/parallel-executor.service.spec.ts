import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type {
  ExecutableTask,
  ExecutableTaskCollection,
} from '../task-manager/models/task.models';
import { EXECUTION_EVENTS } from './events/execution.events';
import type { ExecutionProgress } from './models/execution.models';
import { ConcurrencyCoordinator } from './processors/concurrency.coordinator';
import { DependencyResolver } from './processors/dependency.resolver';
import { ExecutionController } from './processors/execution.controller';
import { ExecutionMonitor } from './processors/execution.monitor';
import { LocalWorkerAdapter } from './processors/local.worker.adapter';
import { ProgressPublisher } from './processors/progress.publisher';
import { ResourceCoordinator } from './processors/resource.coordinator';
import { WorkerDispatcher } from './processors/worker.dispatcher';
import { ParallelExecutorService } from './parallel-executor.service';

function task(
  id: string,
  deps: string[] = [],
  extras: Record<string, string | number | boolean | null> = {},
): ExecutableTask {
  return Object.freeze({
    id,
    workflowId: 'wf-api-exec',
    dependencyIds: Object.freeze(deps),
    state: deps.length === 0 ? ('READY' as const) : ('WAITING' as const),
    metadata: Object.freeze({
      order: extras.order ?? 0,
      strategyKind: extras.strategyKind ?? 'hybrid',
      ...extras,
    }),
    traceId: 'trace-api-exec',
    createdAt: new Date().toISOString(),
  });
}

function collection(tasks: ExecutableTask[]): ExecutableTaskCollection {
  const ready = tasks.filter((t) => t.state === 'READY').map((t) => t.id);
  return Object.freeze({
    workflowId: 'wf-api-exec',
    tasks: Object.freeze(tasks),
    metadata: Object.freeze({
      schemaVersion: '1.0.0' as const,
      taskCount: tasks.length,
      readyCount: ready.length,
      waitingCount: tasks.length - ready.length,
      readyTaskIds: Object.freeze(ready),
      dispatchPrepared: true,
      extras: Object.freeze({ traceId: 'trace-api-exec' }),
    }),
    createdAt: new Date().toISOString(),
  });
}

function assertProgress(p: ExecutionProgress): void {
  assert.ok(p.workflowId);
  assert.ok(typeof p.completedTasks === 'number');
  assert.ok(typeof p.runningTasks === 'number');
  assert.ok(typeof p.pendingTasks === 'number');
  assert.ok(typeof p.failedTasks === 'number');
  assert.ok(typeof p.progressPercentage === 'number');
  assert.ok(p.metadata);
  assert.ok(p.traceId);
  assert.ok(p.timestamp);
}

function createService(): {
  service: ParallelExecutorService;
  events: string[];
} {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('execution.#', (e) => {
    events.push(e.topic);
  });

  const controller = new ExecutionController(
    new DependencyResolver(),
    new ConcurrencyCoordinator(config),
    new WorkerDispatcher(new LocalWorkerAdapter()),
    new ResourceCoordinator(config),
    new ExecutionMonitor(),
    new ProgressPublisher(config),
  );

  const service = new ParallelExecutorService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    controller,
  );
  return { service, events };
}

describe('ParallelExecutorService public API', () => {
  let service: ParallelExecutorService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('execute runs dependency chain and emits events', async () => {
    const result = await service.execute(
      collection([
        task('a', [], { order: 1 }),
        task('b', ['a'], { order: 2 }),
        task('c', ['b'], { order: 3 }),
      ]),
    );
    assertProgress(result);
    assert.equal(result.completedTasks, 3);
    assert.equal(result.failedTasks, 0);
    assert.equal(result.progressPercentage, 100);
    assert.ok(events.includes(EXECUTION_EVENTS.started));
    assert.ok(events.includes(EXECUTION_EVENTS.progress));
    assert.ok(events.includes(EXECUTION_EVENTS.completed));
  });

  it('records failed tasks without retry', async () => {
    const result = await service.execute(
      collection([
        task('a', [], { order: 1, forceFail: true }),
        task('b', ['a'], { order: 2 }),
      ]),
    );
    assertProgress(result);
    assert.ok(result.failedTasks >= 1);
    assert.equal(result.completedTasks, 0);
  });
});

describe('Parallel Executor contract', () => {
  it('keeps identical top-level ExecutionProgress keys', async () => {
    const { service } = createService();
    const a = await service.execute(collection([task('only')]));
    const b = await service.execute(
      collection([task('x'), task('y', ['x'])]),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  });
});
