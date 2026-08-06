import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  POLICY_CONTROLLER,
  POLICY_REGISTRY,
  type IPolicyController,
  type IPolicyRegistry,
  type IPolicyService,
} from './contracts';
import type { PolicyRequestDto } from './dto/policy.dto';
import { POLICY_EVENTS } from './events/policy.events';
import type { EffectivePolicy } from './models/policy.models';
import { createBuiltinPolicies } from './processors/builtin.policies';

/**
 * Policy Service public API (Layer 4.7).
 * Sole method: resolve(request) → EffectivePolicy.
 */
@Injectable()
export class PolicyService implements IPolicyService, OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly eventBus: EventBusService,
    private readonly health: HealthService,
    @Inject(POLICY_CONTROLLER) private readonly controller: IPolicyController,
    @Inject(POLICY_REGISTRY) private readonly registry: IPolicyRegistry,
  ) {}

  onModuleInit(): void {
    for (const doc of createBuiltinPolicies()) {
      const existing = this.registry.get(doc.policyId);
      this.registry.register(doc);
      void this.emit(
        existing ? POLICY_EVENTS.updated : POLICY_EVENTS.registered,
        {
          policyId: doc.policyId,
          version: doc.version,
          scope: doc.scope.level,
        },
        {},
      );
      if (existing && existing.version !== doc.version) {
        void this.emit(
          POLICY_EVENTS.versionCreated,
          { policyId: doc.policyId, version: doc.version },
          {},
        );
      }
    }
  }

  async resolve(request: PolicyRequestDto): Promise<EffectivePolicy> {
    if (!this.config.policy.enabled) {
      throw new Error('PolicyService is disabled');
    }

    const startedAt = Date.now();
    this.health.getLiveness();
    let requestId: string | undefined = request?.requestId;
    let traceId: string | undefined = request?.traceId;

    try {
      await this.emit(
        POLICY_EVENTS.resolutionStarted,
        { requestId, resource: request?.resource },
        {},
      );
      this.logger.info('policy.resolution.started', { requestId });

      const result = await this.controller.resolve(request);
      requestId = result.requestId;
      traceId = result.traceId;

      const durationMs = Date.now() - startedAt;
      this.metrics.recordPipelineDuration(durationMs, {
        pipeline: 'policy',
        status: 'completed',
      });

      await this.emit(
        POLICY_EVENTS.resolutionCompleted,
        {
          requestId,
          version: result.version,
          ruleCount: result.rules.length,
          durationMs,
        },
        { id: requestId },
      );
      this.logger.info('policy.resolution.completed', { requestId });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.metrics.recordError({ component: 'policy' });
      this.metrics.recordPipelineDuration(Date.now() - startedAt, {
        pipeline: 'policy',
        status: 'failed',
      });
      await this.emit(
        POLICY_EVENTS.resolutionFailed,
        { requestId, traceId, error: message },
        { id: requestId },
      );
      this.logger.error('policy.resolution.failed', {
        requestId,
        error: message,
      });
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async emit(
    topic: string,
    payload: Record<string, unknown>,
    ctx: { id?: string; organizationId?: string; userId?: string },
  ): Promise<void> {
    if (!this.config.policy.emitEvents) return;
    await this.eventBus.publish(topic, payload, {
      correlationId: ctx.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      source: 'policy-service',
    });
  }
}
