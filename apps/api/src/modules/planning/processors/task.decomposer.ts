import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import type { ITaskDecomposer } from '../contracts/planning.contracts';
import type { PlanInputDto } from '../dto/plan-input.dto';
import type {
  PlanTask,
  PlanTaskKind,
  StrategyPlan,
  TaskGroup,
  TaskPlan,
} from '../models/execution-blueprint.models';

/**
 * Task Decomposer — break StrategyPlan into logical tasks/groups.
 * No worker assignment. No execution.
 */
@Injectable()
export class TaskDecomposer implements ITaskDecomposer {
  constructor(private readonly config: ConfigService) {}

  decompose(strategy: StrategyPlan, input: PlanInputDto): TaskPlan {
    const maxTasks = Math.min(
      input.planHints?.maxTasks ?? this.config.planning.maxTasks,
      this.config.planning.maxTasks,
    );
    const includeVerification = input.planHints?.includeVerification !== false;

    const prepareGroupId = randomUUID();
    const enactGroupId = randomUUID();
    const verifyGroupId = randomUUID();

    const prepareMilestone = strategy.milestones.find((m) => m.name === 'prepare');
    const enactMilestone = strategy.milestones.find((m) => m.name === 'enact');
    const verifyMilestone = strategy.milestones.find((m) => m.name === 'verify');

    const tasks: PlanTask[] = [];
    let order = 1;

    const push = (
      groupId: string,
      kind: PlanTaskKind,
      title: string,
      description: string,
      milestoneId?: string,
      parentTaskId?: string,
    ): PlanTask => {
      const task = Object.freeze({
        id: randomUUID(),
        groupId,
        parentTaskId,
        kind,
        title,
        description,
        order: order++,
        milestoneId,
      });
      tasks.push(task);
      return task;
    };

    const prepareRoot = push(
      prepareGroupId,
      'prepare',
      'prepare_context',
      `Prepare context for ${strategy.selectedActionTitle}`,
      prepareMilestone?.id,
    );
    push(
      prepareGroupId,
      'validate',
      'validate_preconditions',
      'Validate preconditions and constraints before enactment',
      prepareMilestone?.id,
      prepareRoot.id,
    );

    if (strategy.metadata.approvalRequired === true) {
      push(
        prepareGroupId,
        'validate',
        'approval_gate',
        'Represent approval requirement prior to irreversible steps',
        prepareMilestone?.id,
        prepareRoot.id,
      );
    }

    const enactRoot = push(
      enactGroupId,
      'execute',
      'enact_selected_action',
      `Logical enactment of ${strategy.selectedActionTitle}`,
      enactMilestone?.id,
    );
    push(
      enactGroupId,
      'execute',
      'capture_outputs',
      'Capture logical outputs of selected action for verification',
      enactMilestone?.id,
      enactRoot.id,
    );

    if (includeVerification) {
      const verifyRoot = push(
        verifyGroupId,
        'verify',
        'verify_outcomes',
        'Verify outcomes against success criteria',
        verifyMilestone?.id,
      );
      push(
        verifyGroupId,
        'finalize',
        'finalize_blueprint',
        'Finalize planned outcomes and close verification',
        verifyMilestone?.id,
        verifyRoot.id,
      );
    } else {
      push(
        enactGroupId,
        'finalize',
        'finalize_without_verification',
        'Finalize without dedicated verification milestone',
        enactMilestone?.id,
        enactRoot.id,
      );
    }

    const limited = tasks.slice(0, maxTasks);
    const groups: TaskGroup[] = [
      Object.freeze({
        id: prepareGroupId,
        name: 'prepare',
        order: 1,
        taskIds: Object.freeze(
          limited.filter((t) => t.groupId === prepareGroupId).map((t) => t.id),
        ),
      }),
      Object.freeze({
        id: enactGroupId,
        name: 'enact',
        order: 2,
        taskIds: Object.freeze(
          limited.filter((t) => t.groupId === enactGroupId).map((t) => t.id),
        ),
      }),
    ];

    if (limited.some((t) => t.groupId === verifyGroupId)) {
      groups.push(
        Object.freeze({
          id: verifyGroupId,
          name: 'verify',
          order: 3,
          taskIds: Object.freeze(
            limited.filter((t) => t.groupId === verifyGroupId).map((t) => t.id),
          ),
        }),
      );
    }

    const logicalOrder = Object.freeze(
      [...limited].sort((a, b) => a.order - b.order).map((t) => t.id),
    );

    return Object.freeze({
      tasks: Object.freeze(limited),
      groups: Object.freeze(groups.filter((g) => g.taskIds.length > 0)),
      logicalOrder,
    });
  }
}
