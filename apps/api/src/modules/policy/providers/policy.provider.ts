import type {
  PolicyDocument,
  PolicyScopeLevel,
} from '../models/policy.models';

/**
 * Policy Provider Interface — storage independent.
 * Never enforces or executes policies.
 */
export interface IPolicyProvider {
  readonly providerId: string;
  save(document: PolicyDocument): void;
  get(policyId: string): PolicyDocument | undefined;
  list(scopeLevel?: PolicyScopeLevel): readonly PolicyDocument[];
  remove(policyId: string): boolean;
}
