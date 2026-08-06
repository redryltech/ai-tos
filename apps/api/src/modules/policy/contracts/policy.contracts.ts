import type { PolicyRequestDto } from '../dto/policy.dto';
import type {
  ComposedPolicyTree,
  EffectivePolicy,
  PolicyDocument,
  PolicyRequest,
  PolicyRule,
  PolicyScopeLevel,
  ResolvedPolicies,
} from '../models/policy.models';
import type { IPolicyProvider } from '../providers/policy.provider';

export const POLICY_SERVICE = Symbol('POLICY_SERVICE');
export const POLICY_CONTROLLER = Symbol('POLICY_CONTROLLER');
export const POLICY_REGISTRY = Symbol('POLICY_REGISTRY');
export const POLICY_COMPOSER = Symbol('POLICY_COMPOSER');
export const POLICY_RESOLVER = Symbol('POLICY_RESOLVER');
export const POLICY_CONFLICT_RESOLVER = Symbol('POLICY_CONFLICT_RESOLVER');
export const EFFECTIVE_POLICY_BUILDER = Symbol('EFFECTIVE_POLICY_BUILDER');
export const POLICY_PROVIDER = Symbol('POLICY_PROVIDER');

export interface IPolicyRegistry {
  register(document: PolicyDocument): void;
  unregister(policyId: string): boolean;
  get(policyId: string): PolicyDocument | undefined;
  list(scopeLevel?: PolicyScopeLevel): readonly PolicyDocument[];
  setLifecycle(
    policyId: string,
    lifecycle: PolicyDocument['lifecycle'],
  ): void;
}

export interface IPolicyComposer {
  compose(scope: PolicyRequest['scope']): ComposedPolicyTree;
}

export interface IPolicyResolver {
  resolve(
    request: PolicyRequest,
    tree: ComposedPolicyTree,
  ): ResolvedPolicies;
}

export interface IPolicyConflictResolver {
  resolve(rules: readonly PolicyRule[]): readonly PolicyRule[];
}

export interface IEffectivePolicyBuilder {
  build(
    request: PolicyRequest,
    rules: readonly PolicyRule[],
    documents: readonly PolicyDocument[],
  ): EffectivePolicy;
}

export interface IPolicyController {
  resolve(dto: PolicyRequestDto): Promise<EffectivePolicy>;
}

/** Sole public Policy Service contract. */
export interface IPolicyService {
  resolve(request: PolicyRequestDto): Promise<EffectivePolicy>;
}

export type { IPolicyProvider };
