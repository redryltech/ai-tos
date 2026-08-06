import { Global, Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { CommunicationManagerService } from './communication-manager.service';
import {
  COMMUNICATION_MANAGER,
  CONTEXT_MANAGER,
  LIFECYCLE_MANAGER,
  RESOURCE_MANAGER,
  STATE_MANAGER,
  TASK_SCHEDULER,
} from './contracts';
import { ContextManagerService } from './context-manager.service';
import { LifecycleManagerService } from './lifecycle-manager.service';
import { ResourceManagerService } from './resource-manager.service';
import { StateManagerService } from './state-manager.service';
import {
  CONTEXT_STORE,
  LIFECYCLE_STORE,
  MemoryContextStore,
  MemoryLifecycleStore,
  MemoryResourceStore,
  MemoryStateStore,
  MemoryTaskStore,
  RESOURCE_STORE,
  STATE_STORE,
  TASK_STORE,
} from './storage';
import { TaskSchedulerService } from './task-scheduler.service';

/**
 * AI Kernel module (Phase 2.2.x).
 * Consumers inject service tokens (I* contracts); defaults are concrete managers + memory stores.
 */
@Global()
@Module({
  imports: [ConfigurationModule, EventBusModule],
  providers: [
    MemoryTaskStore,
    MemoryContextStore,
    MemoryStateStore,
    MemoryResourceStore,
    MemoryLifecycleStore,
    { provide: TASK_STORE, useExisting: MemoryTaskStore },
    { provide: CONTEXT_STORE, useExisting: MemoryContextStore },
    { provide: STATE_STORE, useExisting: MemoryStateStore },
    { provide: RESOURCE_STORE, useExisting: MemoryResourceStore },
    { provide: LIFECYCLE_STORE, useExisting: MemoryLifecycleStore },
    TaskSchedulerService,
    ContextManagerService,
    StateManagerService,
    ResourceManagerService,
    LifecycleManagerService,
    CommunicationManagerService,
    { provide: TASK_SCHEDULER, useExisting: TaskSchedulerService },
    { provide: CONTEXT_MANAGER, useExisting: ContextManagerService },
    { provide: STATE_MANAGER, useExisting: StateManagerService },
    { provide: RESOURCE_MANAGER, useExisting: ResourceManagerService },
    { provide: LIFECYCLE_MANAGER, useExisting: LifecycleManagerService },
    { provide: COMMUNICATION_MANAGER, useExisting: CommunicationManagerService },
  ],
  exports: [
    TASK_SCHEDULER,
    CONTEXT_MANAGER,
    STATE_MANAGER,
    RESOURCE_MANAGER,
    LIFECYCLE_MANAGER,
    COMMUNICATION_MANAGER,
  ],
})
export class KernelModule {}
