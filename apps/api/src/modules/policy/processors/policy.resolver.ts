import { Injectable } from '@nestjs/common';
import type { IPolicyResolver } from '../contracts';
import type {
  ComposedPolicyTree,
  PolicyDocument,
  PolicyRequest,
  ResolvedPolicies,
} from '../models/policy.models';
import { POLICY_SCOPE_ORDER } from '../models/policy.models';

/**
 * Policy Resolver — determine applicable / inherited / active policies.
 * Never enforces.
 */
@Injectable()
export class PolicyResolver implements IPolicyResolver {
  resolve(
    request: PolicyRequest,
    tree: ComposedPolicyTree,
  ): ResolvedPolicies {
    const applicable: PolicyDocument[] = [];
    const inherited: PolicyDocument[] = [];
    const active: PolicyDocument[] = [];

    for (const level of POLICY_SCOPE_ORDER) {
      const docs = tree.layers[level] ?? [];
      for (const doc of docs) {
        applicable.push(doc);
        if (level !== 'session' && level !== 'user') {
          inherited.push(doc);
        }
        if (doc.lifecycle === 'active' || doc.lifecycle === 'registered') {
          if (this.matchesResource(doc, request.resource)) {
            active.push(doc);
          }
        }
      }
    }

    return Object.freeze({
      applicable: Object.freeze(applicable),
      inherited: Object.freeze(inherited),
      active: Object.freeze(active),
    });
  }

  private matchesResource(doc: PolicyDocument, resource: string): boolean {
    return doc.rules.some(
      (rule) =>
        rule.resource === '*' ||
        rule.resource === resource ||
        resource.startsWith(`${rule.resource}:`) ||
        (rule.resource.endsWith('.*') &&
          resource.startsWith(rule.resource.slice(0, -1))),
    );
  }
}
