import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  DEPENDENCY_GRAPH_BUILDER,
  EXECUTABLE_WORKFLOW_BUILDER,
  EXECUTION_STRATEGY_BUILDER,
  WORKFLOW_BUILDER,
  WORKFLOW_CONTEXT_MANAGER,
  WORKFLOW_CONTROLLER,
  WORKFLOW_SERVICE,
  WORKFLOW_VALIDATOR,
} from './contracts';
import { DependencyGraphBuilder } from './processors/dependency.graph.builder';
import { ExecutableWorkflowBuilder } from './processors/executable.workflow.builder';
import { ExecutionStrategyBuilder } from './processors/execution.strategy.builder';
import { WorkflowBuilder } from './processors/workflow.builder';
import { WorkflowContextManager } from './processors/workflow.context.manager';
import { WorkflowController } from './processors/workflow.controller';
import { WorkflowValidator } from './processors/workflow.validator';
import { WorkflowService } from './workflow.service';

/**
 * Workflow Engine (Layer 5.1).
 * Public API: WORKFLOW_SERVICE → IWorkflowService.createWorkflow()
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
    WorkflowBuilder,
    DependencyGraphBuilder,
    WorkflowValidator,
    ExecutionStrategyBuilder,
    WorkflowContextManager,
    ExecutableWorkflowBuilder,
    WorkflowController,
    WorkflowService,
    { provide: WORKFLOW_BUILDER, useExisting: WorkflowBuilder },
    { provide: DEPENDENCY_GRAPH_BUILDER, useExisting: DependencyGraphBuilder },
    { provide: WORKFLOW_VALIDATOR, useExisting: WorkflowValidator },
    { provide: EXECUTION_STRATEGY_BUILDER, useExisting: ExecutionStrategyBuilder },
    { provide: WORKFLOW_CONTEXT_MANAGER, useExisting: WorkflowContextManager },
    {
      provide: EXECUTABLE_WORKFLOW_BUILDER,
      useExisting: ExecutableWorkflowBuilder,
    },
    { provide: WORKFLOW_CONTROLLER, useExisting: WorkflowController },
    { provide: WORKFLOW_SERVICE, useExisting: WorkflowService },
  ],
  exports: [WORKFLOW_SERVICE],
})
export class WorkflowModule {}
