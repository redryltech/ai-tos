import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import type {
  ExecutableTask,
  ExecutableTaskCollection,
} from '../../task-manager/models/task.models';
import { ConcurrencyCoordinator } from './concurrency.coordinator';
import { DependencyResolver } from './dependency.resolver';
import { ExecutionMonitor } from './execution.monitor';
import { LocalWorkerAdapter } from './local.worker.adapter';
import { ProgressPublisher } from './progress.publisher';
import { ResourceCoordinator } from './resource.coordinator';
import { WorkerDispatcher } from './worker.dispatcher';
import { ExecutionError } from '../models/execution.models';

function task(
  id: string,
  deps: string[] = [],
  extras: Record<string, string | number | boolean | null> = {},
): ExecutableTask {
  return Object.freeze({
    id,
    workflowId: 'wf-exec-1',
    dependencyIds: Object.freeze(deps),
    state: deps.length === 0 ? ('READY' as const) : ('WAITING' as const),
    metadata: Object.freeze({
      order: extras.order ?? Number(id.replace(/\D/g, '') || 0),
      strategyKind: extras.strategyKind ?? 'hybrid',
      ...extras,
    }),
    traceId: 'trace-exec-1',
    createdAt: new Date().toISOString(),
  });
}

function collection(
  tasks: ExecutableTask[],
): ExecutableTaskCollection {
  const ready = tasks.filter((t) => t.state === 'READY').map((t) => t.id);
  return Object.freeze({
    workflowId: 'wf-exec-1',
    tasks: Object.freeze(tasks),
    metadata: Object.freeze({
      schemaVersion: '1.0.0' as const,
      taskCount: tasks.length,
      readyCount: ready.length,
      waitingCount: tasks.length - ready.length,
      readyTaskIds: Object.freeze(ready),
      dispatchPrepared: true,
      extras: Object.freeze({ traceId: 'trace-exec-1' }),
    }),
    createdAt: new Date().toISOString(),
  });
}

describe('DependencyResolver', () => {
  it('returns only tasks with satisfied dependencies', () => {
    const c = collection([task('a'), task('b', ['a']), task('c', ['b'])]);
    const resolver = new DependencyResolver();
    const wave1 = resolver.resolveReady(c, new Set(), new Set(), new Set());
    assert.deepEqual(
      wave1.map((t) => t.id),
      ['a'],
    );
    const wave2 = resolver.resolveReady(
      c,
      new Set(['a']),
      new Set(),
      new Set(),
    );
    assert.deepEqual(
      wave2.map((t) => t.id),
      ['b'],
    );
  });

  it('rejects invalid dependency references', () => {
    const c = collection([task('a', ['missing'])]);
    assert.throws(
      () =>
        new DependencyResolver().resolveReady(
          c,
          new Set(),
          new Set(),
          new Set(),
        ),
      ExecutionError,
    );
  });
});

describe('ConcurrencyCoordinator', () => {
  it('limits batch size by max concurrency', () => {
    const ready = [task('a'), task('b'), task('c')];
    const batch = new ConcurrencyCoordinator(new ConfigService()).selectBatch(
      ready,
      0,
    );
    assert.ok(batch.length <= new ConfigService().execution.maxConcurrency);
    assert.ok(batch.length >= 1);
  });

  it('forces sequential when strategy is sequential', () => {
    const ready = [
      task('a', [], { strategyKind: 'sequential' }),
      task('b', [], { strategyKind: 'sequential' }),
    ];
    const batch = new ConcurrencyCoordinator(new ConfigService()).selectBatch(
      ready,
      0,
    );
    assert.equal(batch.length, 1);
  });
});

describe('WorkerDispatcher + ResourceCoordinator + Progress', () => {
  it('dispatches via adapter and publishes progress', async () => {
    const config = new ConfigService();
    const resources = new ResourceCoordinator(config);
    resources.reset();
    const tasks = [task('a'), task('b')];
    const leases = tasks.map((t) => resources.tryAcquire(t));
    assert.ok(leases.every(Boolean));

    const results = await new WorkerDispatcher(
      new LocalWorkerAdapter(),
    ).dispatch(tasks);
    assert.equal(results.length, 2);
    assert.ok(results.every((r) => r.success));
    for (const lease of leases) resources.release(lease!);

    const c = collection(tasks);
    const monitor = new ExecutionMonitor();
    let snapshot = monitor.create(c);
    snapshot = monitor.markRunning(snapshot, ['a', 'b']);
    snapshot = monitor.markCompleted(snapshot, 'a');
    snapshot = monitor.markCompleted(snapshot, 'b');
    const progress = new ProgressPublisher(config).publish(snapshot, c, {
      dispatchWaves: 1,
    });
    assert.equal(progress.completedTasks, 2);
    assert.equal(progress.progressPercentage, 100);
    assert.equal(progress.workflowId, 'wf-exec-1');
  });
});
