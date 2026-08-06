import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  EFFECTIVE_POLICY_BUILDER,
  POLICY_COMPOSER,
  POLICY_CONFLICT_RESOLVER,
  POLICY_RESOLVER,
  type IEffectivePolicyBuilder,
  type IPolicyComposer,
  type IPolicyConflictResolver,
  type IPolicyController,
  type IPolicyResolver,
} from '../contracts';
import type { PolicyRequestDto } from '../dto/policy.dto';
import type {
  EffectivePolicy,
  PolicyRequest,
  PolicyScopeLevel,
} from '../models/policy.models';
import { POLICY_SCOPE_ORDER } from '../models/policy.models';

/**
 * Policy Controller — validate and start resolution pipeline.
 * Never evaluates business logic.
 */
@Injectable()
export class PolicyController implements IPolicyController {
  constructor(
    @Inject(POLICY_COMPOSER) private readonly composer: IPolicyComposer,
    @Inject(POLICY_RESOLVER) private readonly resolver: IPolicyResolver,
    @Inject(POLICY_CONFLICT_RESOLVER)
    private readonly conflicts: IPolicyConflictResolver,
    @Inject(EFFECTIVE_POLICY_BUILDER)
    private readonly builder: IEffectivePolicyBuilder,
  ) {}

  async resolve(dto: PolicyRequestDto): Promise<EffectivePolicy> {
    const request = this.validate(dto);
    const tree = this.composer.compose(request.scope);
    const resolved = this.resolver.resolve(request, tree);
    const allRules = resolved.active.flatMap((d) => d.rules);
    const rules = this.conflicts.resolve(allRules);
    return this.builder.build(request, rules, resolved.active);
  }

  private validate(dto: PolicyRequestDto): PolicyRequest {
    if (!dto || typeof dto !== 'object') {
      throw new Error('PolicyRequest is required');
    }
    if (!dto.resource || typeof dto.resource !== 'string') {
      throw new Error('PolicyRequest.resource is required');
    }

    const scope = {} as Record<PolicyScopeLevel, string | undefined>;
    for (const level of POLICY_SCOPE_ORDER) {
      const value = dto.scope?.[level];
      scope[level] =
        typeof value === 'string' && value.trim() ? value.trim() : undefined;
    }

    return Object.freeze({
      requestId:
        typeof dto.requestId === 'string' && dto.requestId.trim()
          ? dto.requestId.trim()
          : randomUUID(),
      scope: Object.freeze(scope),
      subject: Object.freeze({ ...(dto.subject ?? {}) }),
      resource: dto.resource.trim(),
      context: Object.freeze({ ...(dto.context ?? {}) }),
      metadata: Object.freeze({ ...(dto.metadata ?? {}) }),
      traceId:
        typeof dto.traceId === 'string' && dto.traceId.trim()
          ? dto.traceId.trim()
          : randomUUID(),
    });
  }
}
