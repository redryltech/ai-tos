import { Injectable } from '@nestjs/common';
import type { IEffectivePolicyBuilder } from '../contracts';
import type {
  EffectivePolicy,
  PolicyDocument,
  PolicyRequest,
  PolicyRule,
} from '../models/policy.models';

/**
 * Effective Policy Builder — immutable EffectivePolicy.
 * Never performs execution.
 */
@Injectable()
export class EffectivePolicyBuilder implements IEffectivePolicyBuilder {
  build(
    request: PolicyRequest,
    rules: readonly PolicyRule[],
    documents: readonly PolicyDocument[],
  ): EffectivePolicy {
    const constraints: Record<string, string | number | boolean | null> = {};
    const permissions = new Set<string>();
    const obligations = new Set<string>();

    for (const doc of documents) {
      Object.assign(constraints, doc.constraints);
      for (const p of doc.permissions) permissions.add(p);
      for (const o of doc.obligations) obligations.add(o);
    }

    for (const rule of rules) {
      if (rule.effect === 'allow') permissions.add(`${rule.action}:${rule.resource}`);
      if (rule.effect === 'obligate') {
        obligations.add(`${rule.action}:${rule.resource}`);
      }
      if (rule.effect === 'deny') {
        permissions.delete(`${rule.action}:${rule.resource}`);
      }
    }

    const versionSeed = documents.map((d) => `${d.policyId}@${d.version}`).join('|');
    const version = `ep-${hash(versionSeed || 'empty')}`;

    return Object.freeze({
      requestId: request.requestId,
      scope: Object.freeze({ ...request.scope }),
      rules: Object.freeze([...rules]),
      constraints: Object.freeze(constraints),
      permissions: Object.freeze([...permissions].sort()),
      obligations: Object.freeze([...obligations].sort()),
      version,
      metadata: Object.freeze({
        ...(request.metadata ?? {}),
        documentCount: documents.length,
        ruleCount: rules.length,
        builtAt: Date.now(),
      }),
      traceId: request.traceId,
    });
  }
}

function hash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}
