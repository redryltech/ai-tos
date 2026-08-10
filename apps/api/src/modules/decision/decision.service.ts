import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { Thought } from '../thinking/models/thought.models';
import {
  COMMITMENT_MANAGER,
  CONSTRAINT_VALIDATOR,
  EVIDENCE_VALIDATOR,
  JUDGMENT_CORE,
  type ICommitmentManager,
  type IConstraintValidator,
  type IDecisionService,
  type IEvidenceValidator,
  type IJudgmentCore,
} from './contracts';
import type { DecideInputDto } from './dto/decide-input.dto';
import { DECISION_EVENTS } from './events/decision.events';
import type { Decision } from './models/decision.models';

function isThought(input: Thought | DecideInputDto): input is Thought {
  return (
    input != null &&
    typeof input === 'object' &&
    'candidateSolutions' in input &&
    'reasoning' in input &&
    !('thought' in input)
  );
}

/**
 * Decision Engine public API (Layer 3.3).
 * Sole public method: decide(thought) → Decision.
 * Never reasons, plans, executes, allocates, schedules, or calls workers/providers.
 *
 * Boundary: COGNITIVE_PRODUCT_ADJACENT — not SA Platform Decision ownership.
 * Access (RBAC) ≠ Business Decision. Resource allocation ≠ Business Decision.
 */
@Injectable()
export class DecisionService implements IDecisionService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(EVIDENCE_VALIDATOR) private readonly evidenceValidator: IEvidenceValidator,
    @Inject(CONSTRAINT_VALIDATOR) private readonly constraintValidator: IConstraintValidator,
    @Inject(JUDGMENT_CORE) private readonly judgmentCore: IJudgmentCore,
    @Inject(COMMITMENT_MANAGER) private readonly commitmentManager: ICommitmentManager,
  ) {}

  async decide(input: Thought | DecideInputDto): Promise<Decision> {
    if (!this.config.decision.enabled) {
      throw new Error('DecisionEngine is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();

    const dto: DecideInputDto = isThought(input) ? { thought: input } : input;
    const thought = dto.thought;
    const requestId: string | undefined = thought?.requestId;

    try {
      if (!thought) {
        throw new Error('Thought is required');
      }

      await this.emit(
        DECISION_EVENTS.started,
        { requestId: thought.requestId, goal: thought.goal },
        thought,
      );

      this.logger.info('decision.started', {
        requestId: thought.requestId,
        organizationId: thought.organizationId,
        userId: thought.userId,
      });

      const evidence = this.evidenceValidator.validate(thought);
      const constraints = this.constraintValidator.validate(thought, dto);
      const judgment = this.judgmentCore.judge(thought, evidence, constraints);
      const decision = this.commitmentManager.commit(
        thought,
        evidence,
        constraints,
        judgment,
      );

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'decision',
        status: 'completed',
      });

      await this.emit(
        DECISION_EVENTS.completed,
        {
          requestId: decision.requestId,
          selectedActionId: decision.selectedAction.id,
          confidence: decision.confidence,
          commitmentLevel: decision.commitmentLevel,
          approvalRequired: decision.approvalRequired,
          durationMs,
        },
        decision,
      );

      this.logger.info('decision.completed', {
        requestId: decision.requestId,
        organizationId: decision.organizationId,
        userId: decision.userId,
      });

      return decision;
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'decision' });
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'decision',
        status: 'failed',
      });

      await this.emit(
        DECISION_EVENTS.failed,
        { requestId, error: message, durationMs },
        {
          requestId,
          organizationId: thought?.organizationId,
          userId: thought?.userId,
        },
      );

      this.logger.error('decision.failed', {
        requestId,
        organizationId: thought?.organizationId,
        userId: thought?.userId,
        error: message,
      });

      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { requestId?: string; organizationId?: string; userId?: string },
  ): Promise<void> {
    if (!this.config.decision.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.requestId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'decision-engine',
    });
  }
}
