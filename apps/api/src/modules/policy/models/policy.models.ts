/** Policy Service domain models (Layer 4.7). Governance only — never enforces. */

export type PolicyScopeLevel =
  | 'global'
  | 'organization'
  | 'department'
  | 'project'
  | 'application'
  | 'user'
  | 'session';

export type PolicyLifecycle =
  | 'registered'
  | 'active'
  | 'deprecated'
  | 'disabled';

export type PolicyEffect = 'allow' | 'deny' | 'obligate';

export const POLICY_SCOPE_ORDER: readonly PolicyScopeLevel[] = Object.freeze([
  'global',
  'organization',
  'department',
  'project',
  'application',
  'user',
  'session',
]);

export interface PolicyScope {
  readonly level: PolicyScopeLevel;
  readonly id?: string;
}

export interface PolicyRule {
  readonly id: string;
  readonly effect: PolicyEffect;
  readonly action: string;
  readonly resource: string;
  readonly priority: number;
  readonly restrictiveness: number;
  readonly allowOverride?: boolean;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface PolicyDocument {
  readonly policyId: string;
  readonly name: string;
  readonly version: string;
  readonly lifecycle: PolicyLifecycle;
  readonly scope: PolicyScope;
  readonly rules: readonly PolicyRule[];
  readonly constraints: Readonly<Record<string, string | number | boolean | null>>;
  readonly permissions: readonly string[];
  readonly obligations: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface PolicyRequest {
  readonly requestId: string;
  readonly scope: Readonly<Record<PolicyScopeLevel, string | undefined>>;
  readonly subject: Readonly<Record<string, string | number | boolean | null>>;
  readonly resource: string;
  readonly context?: Readonly<Record<string, string | number | boolean | null>>;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
}

export interface EffectivePolicy {
  readonly requestId: string;
  readonly scope: Readonly<Record<PolicyScopeLevel, string | undefined>>;
  readonly rules: readonly PolicyRule[];
  readonly constraints: Readonly<Record<string, string | number | boolean | null>>;
  readonly permissions: readonly string[];
  readonly obligations: readonly string[];
  readonly version: string;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
}

export interface ComposedPolicyTree {
  readonly layers: Readonly<
    Record<PolicyScopeLevel, readonly PolicyDocument[]>
  >;
  readonly documents: readonly PolicyDocument[];
}

export interface ResolvedPolicies {
  readonly applicable: readonly PolicyDocument[];
  readonly inherited: readonly PolicyDocument[];
  readonly active: readonly PolicyDocument[];
}
