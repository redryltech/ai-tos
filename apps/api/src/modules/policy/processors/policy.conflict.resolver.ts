import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IPolicyConflictResolver } from '../contracts';
import type { PolicyRule } from '../models/policy.models';

/**
 * Policy Conflict Resolver — deterministic conflict resolution.
 * Most restrictive wins; higher authority override only when allowOverride.
 * Never executes policies.
 */
@Injectable()
export class PolicyConflictResolver implements IPolicyConflictResolver {
  constructor(private readonly config: ConfigService) {}

  resolve(rules: readonly PolicyRule[]): readonly PolicyRule[] {
    if (rules.length === 0) return Object.freeze([]);

    const byKey = new Map<string, PolicyRule[]>();
    for (const rule of rules) {
      const key = `${rule.action}::${rule.resource}`;
      const bucket = byKey.get(key) ?? [];
      bucket.push(rule);
      byKey.set(key, bucket);
    }

    const resolved: PolicyRule[] = [];
    for (const bucket of byKey.values()) {
      resolved.push(this.pickWinner(bucket));
    }

    return Object.freeze(
      resolved.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)),
    );
  }

  private pickWinner(conflicts: PolicyRule[]): PolicyRule {
    const strategy = this.config.policy.conflictStrategy;

    if (strategy === 'highest_authority') {
      const explicit = [...conflicts]
        .filter((r) => r.allowOverride === true)
        .sort((a, b) => b.priority - a.priority);
      if (explicit.length > 0) {
        return explicit[0]!;
      }
    }

    // most_restrictive (default): deny > obligate > allow, then higher restrictiveness
    return [...conflicts].sort((a, b) => {
      const effectRank = (e: PolicyRule['effect']) =>
        e === 'deny' ? 3 : e === 'obligate' ? 2 : 1;
      const byEffect = effectRank(b.effect) - effectRank(a.effect);
      if (byEffect !== 0) return byEffect;
      const byRestrict = b.restrictiveness - a.restrictiveness;
      if (byRestrict !== 0) return byRestrict;
      return b.priority - a.priority;
    })[0]!;
  }
}
