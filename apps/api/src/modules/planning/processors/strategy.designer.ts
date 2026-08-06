import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Decision } from '../../decision/models/decision.models';
import type { IStrategyDesigner } from '../contracts/planning.contracts';
import type { PlanInputDto } from '../dto/plan-input.dto';
import type {
  PlanMilestone,
  PlanObjective,
  StrategyPlan,
} from '../models/execution-blueprint.models';

/**
 * Strategy Designer — build execution strategy from Decision.
 * Never creates runtime schedules.
 */
@Injectable()
export class StrategyDesigner implements IStrategyDesigner {
  design(decision: Decision, input: PlanInputDto): StrategyPlan {
    if (!decision || typeof decision !== 'object') {
      throw new Error('Decision is required');
    }
    if (!decision.requestId) {
      throw new Error('Decision.requestId is required');
    }
    if (!decision.selectedAction?.id) {
      throw new Error('Decision.selectedAction is required');
    }

    const action = decision.selectedAction;
    const priority =
      decision.metadata.priority === 'critical' ||
      decision.metadata.priority === 'high' ||
      decision.metadata.priority === 'low'
        ? decision.metadata.priority
        : 'normal';

    const objectives: PlanObjective[] = [
      Object.freeze({
        id: randomUUID(),
        description: `Realize selected action: ${action.title}`,
        priority,
      }),
      Object.freeze({
        id: randomUUID(),
        description: `Satisfy goal: ${decision.goal}`,
        priority: 'high',
      }),
    ];

    if (decision.approvalRequired) {
      objectives.push(
        Object.freeze({
          id: randomUUID(),
          description: 'Obtain required approval before irreversible steps',
          priority: 'critical',
        }),
      );
    }

    const milestones: PlanMilestone[] = [
      Object.freeze({
        id: randomUUID(),
        name: 'prepare',
        description: 'Prepare inputs and validate readiness',
        order: 1,
      }),
      Object.freeze({
        id: randomUUID(),
        name: 'enact',
        description: `Enact ${action.title}`,
        order: 2,
      }),
      Object.freeze({
        id: randomUUID(),
        name: 'verify',
        description: 'Verify outcomes against success criteria',
        order: 3,
      }),
    ];

    const successCriteria = Object.freeze([
      `Selected action "${action.title}" is fully prepared for downstream execution`,
      'All declared milestones have corresponding planned tasks',
      decision.approvalRequired
        ? 'Approval gate is represented before irreversible work'
        : 'No pending approval gate blocks the blueprint',
      ...(input.planHints?.includeVerification === false
        ? []
        : ['Verification milestone is included']),
    ]);

    const failureCriteria = Object.freeze([
      'Selected action cannot be decomposed into tasks',
      'Blocking constraints prevent a coherent strategy',
      decision.commitmentLevel === 'blocked'
        ? 'Commitment level is blocked'
        : 'Commitment remains actionable',
    ]);

    const constraints = Object.freeze([
      ...decision.risk
        .filter((r) => r.severity === 'high' || r.severity === 'blocking')
        .map((r) => `risk:${r.category}:${r.description}`),
      `commitment:${decision.commitmentLevel}`,
      `confidence:${decision.confidence}`,
      decision.constraintSummary,
    ]);

    return Object.freeze({
      strategyId: randomUUID(),
      name: `strategy:${action.title}`,
      summary: `Design execution strategy for ${action.title} toward ${decision.goal}`,
      selectedActionId: action.id,
      selectedActionTitle: action.title,
      objectives: Object.freeze(objectives),
      milestones: Object.freeze(milestones),
      successCriteria,
      failureCriteria,
      constraints,
      metadata: Object.freeze({
        approvalRequired: decision.approvalRequired,
        commitmentLevel: decision.commitmentLevel,
        rejectedAlternatives: decision.rejectedAlternatives.length,
        preferParallel: input.planHints?.preferParallel ?? true,
      }),
    });
  }
}
