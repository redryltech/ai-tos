import type {
  PolicyDocument,
  PolicyScopeLevel,
} from '../models/policy.models';
import type { IPolicyProvider } from './policy.provider';

/** In-memory policy provider (default). */
export class MemoryPolicyProvider implements IPolicyProvider {
  readonly providerId = 'memory';
  private readonly store = new Map<string, PolicyDocument>();

  save(document: PolicyDocument): void {
    this.store.set(
      document.policyId,
      Object.freeze({
        ...document,
        rules: Object.freeze([...document.rules]),
        permissions: Object.freeze([...document.permissions]),
        obligations: Object.freeze([...document.obligations]),
        constraints: Object.freeze({ ...document.constraints }),
        metadata: Object.freeze({ ...document.metadata }),
        scope: Object.freeze({ ...document.scope }),
      }),
    );
  }

  get(policyId: string): PolicyDocument | undefined {
    return this.store.get(policyId);
  }

  list(scopeLevel?: PolicyScopeLevel): readonly PolicyDocument[] {
    const all = [...this.store.values()];
    const filtered = scopeLevel
      ? all.filter((d) => d.scope.level === scopeLevel)
      : all;
    return Object.freeze(filtered);
  }

  remove(policyId: string): boolean {
    return this.store.delete(policyId);
  }
}
