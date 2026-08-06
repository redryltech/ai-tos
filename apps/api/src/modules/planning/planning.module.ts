import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  DEPENDENCY_DESIGNER,
  EXECUTION_BLUEPRINT_BUILDER,
  PLANNING_SERVICE,
  STRATEGY_DESIGNER,
  TASK_DECOMPOSER,
} from './contracts';
import { PlanningService } from './planning.service';
import { DependencyDesigner } from './processors/dependency.designer';
import { ExecutionBlueprintBuilder } from './processors/execution-blueprint.builder';
import { StrategyDesigner } from './processors/strategy.designer';
import { TaskDecomposer } from './processors/task.decomposer';

/**
 * Planning Engine (Layer 3.4).
 * Public API: PLANNING_SERVICE → IPlanningService.plan()
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
    StrategyDesigner,
    TaskDecomposer,
    DependencyDesigner,
    ExecutionBlueprintBuilder,
    PlanningService,
    { provide: STRATEGY_DESIGNER, useExisting: StrategyDesigner },
    { provide: TASK_DECOMPOSER, useExisting: TaskDecomposer },
    { provide: DEPENDENCY_DESIGNER, useExisting: DependencyDesigner },
    { provide: EXECUTION_BLUEPRINT_BUILDER, useExisting: ExecutionBlueprintBuilder },
    { provide: PLANNING_SERVICE, useExisting: PlanningService },
  ],
  exports: [PLANNING_SERVICE],
})
export class PlanningModule {}
