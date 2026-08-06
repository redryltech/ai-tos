import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  EXECUTABLE_TASK_BUILDER,
  TASK_BUILDER,
  TASK_CONTROLLER,
  TASK_DEPENDENCY_MANAGER,
  TASK_DISPATCHER,
  TASK_LIFECYCLE_MANAGER,
  TASK_MANAGER_SERVICE,
} from './contracts';
import { ExecutableTaskBuilder } from './processors/executable.task.builder';
import { TaskBuilder } from './processors/task.builder';
import { TaskController } from './processors/task.controller';
import { TaskDependencyManager } from './processors/task.dependency.manager';
import { TaskDispatcher } from './processors/task.dispatcher';
import { TaskLifecycleManager } from './processors/task.lifecycle.manager';
import { TaskManagerService } from './task-manager.service';

/**
 * Task Manager (Layer 5.2).
 * Public API: TASK_MANAGER_SERVICE → ITaskManagerService.createTasks()
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
    TaskBuilder,
    TaskDependencyManager,
    TaskLifecycleManager,
    ExecutableTaskBuilder,
    TaskDispatcher,
    TaskController,
    TaskManagerService,
    { provide: TASK_BUILDER, useExisting: TaskBuilder },
    { provide: TASK_DEPENDENCY_MANAGER, useExisting: TaskDependencyManager },
    { provide: TASK_LIFECYCLE_MANAGER, useExisting: TaskLifecycleManager },
    { provide: EXECUTABLE_TASK_BUILDER, useExisting: ExecutableTaskBuilder },
    { provide: TASK_DISPATCHER, useExisting: TaskDispatcher },
    { provide: TASK_CONTROLLER, useExisting: TaskController },
    { provide: TASK_MANAGER_SERVICE, useExisting: TaskManagerService },
  ],
  exports: [TASK_MANAGER_SERVICE],
})
export class TaskManagerModule {}
