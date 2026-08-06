import { Inject, Injectable } from '@nestjs/common';
import {
  POLICY_REGISTRY,
  type IPolicyComposer,
  type IPolicyRegistry,
} from '../contracts';
import type {
  ComposedPolicyTree,
  PolicyDocument,
  PolicyRequest,
  PolicyScopeLevel,
} from '../models/policy.models';
import { POLICY_SCOPE_ORDER } from '../models/policy.models';

/**
 * Policy Composer — hierarchical merge into a composed tree.
 * Never resolves conflicts.
 */
@Injectable()
export class PolicyComposer implements IPolicyComposer {
  constructor(
    @Inject(POLICY_REGISTRY) private readonly registry: IPolicyRegistry,
  ) {}

  compose(scope: PolicyRequest['scope']): ComposedPolicyTree {
    const layers = {} as Record<PolicyScopeLevel, PolicyDocument[]>;
    const documents: PolicyDocument[] = [];

    for (const level of POLICY_SCOPE_ORDER) {
      const scopeId = scope[level];
      const levelDocs = this.registry
        .list(level)
        .filter((doc) => {
          if (doc.lifecycle === 'disabled') return false;
          if (!scopeId) {
            return level === 'global' && !doc.scope.id;
          }
          return !doc.scope.id || doc.scope.id === scopeId;
        });
      layers[level] = levelDocs;
      documents.push(...levelDocs);
    }

    return Object.freeze({
      layers: Object.freeze(
        Object.fromEntries(
          POLICY_SCOPE_ORDER.map((level) => [
            level,
            Object.freeze([...layers[level]]),
          ]),
        ) as Record<PolicyScopeLevel, readonly PolicyDocument[]>,
      ),
      documents: Object.freeze(documents),
    });
  }
}
