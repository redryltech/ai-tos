import type { PolicyDocument } from '../models/policy.models';

/** Seed hierarchical policies for resolution (governance metadata only). */
export function createBuiltinPolicies(): PolicyDocument[] {
  return [
    Object.freeze({
      policyId: 'global-baseline',
      name: 'Global Baseline',
      version: '1.0.0',
      lifecycle: 'active',
      scope: Object.freeze({ level: 'global' as const }),
      rules: Object.freeze([
        Object.freeze({
          id: 'g-deny-destructive',
          effect: 'deny' as const,
          action: 'delete',
          resource: '*',
          priority: 100,
          restrictiveness: 90,
        }),
        Object.freeze({
          id: 'g-allow-read',
          effect: 'allow' as const,
          action: 'read',
          resource: '*',
          priority: 10,
          restrictiveness: 10,
        }),
      ]),
      constraints: Object.freeze({ maxTokens: 4096 }),
      permissions: Object.freeze(['read:*']),
      obligations: Object.freeze(['audit:log']),
      metadata: Object.freeze({ builtin: true }),
    }),
    Object.freeze({
      policyId: 'org-default',
      name: 'Organization Default',
      version: '1.0.0',
      lifecycle: 'active',
      scope: Object.freeze({ level: 'organization' as const, id: 'org-1' }),
      rules: Object.freeze([
        Object.freeze({
          id: 'o-allow-write',
          effect: 'allow' as const,
          action: 'write',
          resource: 'knowledge',
          priority: 50,
          restrictiveness: 20,
        }),
      ]),
      constraints: Object.freeze({ region: 'us' }),
      permissions: Object.freeze(['write:knowledge']),
      obligations: Object.freeze(['retention:30d']),
      metadata: Object.freeze({ builtin: true }),
    }),
    Object.freeze({
      policyId: 'project-strict',
      name: 'Project Strict',
      version: '1.0.0',
      lifecycle: 'active',
      scope: Object.freeze({ level: 'project' as const, id: 'proj-1' }),
      rules: Object.freeze([
        Object.freeze({
          id: 'p-deny-write',
          effect: 'deny' as const,
          action: 'write',
          resource: 'knowledge',
          priority: 80,
          restrictiveness: 80,
        }),
        Object.freeze({
          id: 'p-obligate-review',
          effect: 'obligate' as const,
          action: 'review',
          resource: 'decision',
          priority: 40,
          restrictiveness: 40,
        }),
      ]),
      constraints: Object.freeze({ requireApproval: true }),
      permissions: Object.freeze([]),
      obligations: Object.freeze(['human:review']),
      metadata: Object.freeze({ builtin: true }),
    }),
    Object.freeze({
      policyId: 'user-session',
      name: 'User Session',
      version: '1.0.0',
      lifecycle: 'active',
      scope: Object.freeze({ level: 'session' as const, id: 'sess-1' }),
      rules: Object.freeze([
        Object.freeze({
          id: 's-allow-read-models',
          effect: 'allow' as const,
          action: 'read',
          resource: 'model',
          priority: 20,
          restrictiveness: 5,
          allowOverride: true,
        }),
      ]),
      constraints: Object.freeze({}),
      permissions: Object.freeze(['read:model']),
      obligations: Object.freeze([]),
      metadata: Object.freeze({ builtin: true }),
    }),
  ];
}
