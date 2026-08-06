import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  CONCURRENCY_COORDINATOR,
  DEPENDENCY_RESOLVER,
  EXECUTION_CONTROLLER,
  EXECUTION_MONITOR,
  PARALLEL_EXECUTOR_SERVICE,
  PROGRESS_PUBLISHER,
  RESOURCE_COORDINATOR,
  WORKER_ADAPTER,
  WORKER_DISPATCHER,
} from './contracts';
import { ConcurrencyCoordinator } from './processors/concurrency.coordinator';
import { DependencyResolver } from './processors/dependency.resolver';
import { ExecutionController } from './processors/execution.controller';
import { ExecutionMonitor } from './processors/execution.monitor';
import { LocalWorkerAdapter } from './processors/local.worker.adapter';
import { ProgressPublisher } from './processors/progress.publisher';
import { ResourceCoordinator } from './processors/resource.coordinator';
import { WorkerDispatcher } from './processors/worker.dispatcher';
import { ParallelExecutorService } from './parallel-executor.service';

/**
 * Parallel Executor (Layer 5.3).
 * Public API: PARALLEL_EXECUTOR_SERVICE → IParallelExecutorService.execute()
 */
@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    MetricsModule,
    EventBusModule,
    HealthModule,
  ],
  providers: [
    DependencyResolver,
    ConcurrencyCoordinator,
    LocalWorkerAdapter,
    WorkerDispatcher,
    ResourceCoordinator,
    ExecutionMonitor,
    ProgressPublisher,
    ExecutionController,
    ParallelExecutorService,
    { provide: DEPENDENCY_RESOLVER, useExisting: DependencyResolver },
    { provide: CONCURRENCY_COORDINATOR, useExisting: ConcurrencyCoordinator },
    { provide: WORKER_ADAPTER, useExisting: LocalWorkerAdapter },
    { provide: WORKER_DISPATCHER, useExisting: WorkerDispatcher },
    { provide: RESOURCE_COORDINATOR, useExisting: ResourceCoordinator },
    { provide: EXECUTION_MONITOR, useExisting: ExecutionMonitor },
    { provide: PROGRESS_PUBLISHER, useExisting: ProgressPublisher },
    { provide: EXECUTION_CONTROLLER, useExisting: ExecutionController },
    {
      provide: PARALLEL_EXECUTOR_SERVICE,
      useExisting: ParallelExecutorService,
    },
  ],
  exports: [PARALLEL_EXECUTOR_SERVICE],
})
export class ParallelExecutorModule {}
