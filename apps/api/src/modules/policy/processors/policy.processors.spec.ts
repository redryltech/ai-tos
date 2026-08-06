import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import { MemoryPolicyProvider } from '../providers/memory.policy.provider';
import { createBuiltinPolicies } from './builtin.policies';
import { EffectivePolicyBuilder } from './effective.policy.builder';
import { PolicyComposer } from './policy.composer';
import { PolicyConflictResolver } from './policy.conflict.resolver';
import { PolicyRegistry } from './policy.registry';
import { PolicyResolver } from './policy.resolver';

function seedRegistry(): PolicyRegistry {
  const registry = new PolicyRegistry(new ConfigService(), new MemoryPolicyProvider());
  for (const doc of createBuiltinPolicies()) {
    registry.register(doc);
  }
  return registry;
}

describe('PolicyRegistry', () => {
  it('registers discovers and versions policies', () => {
    const registry = seedRegistry();
    assert.ok(registry.list().length >= 4);
    assert.equal(registry.get('global-baseline')?.version, '1.0.0');
    registry.setLifecycle('global-baseline', 'deprecated');
    assert.equal(registry.get('global-baseline')?.lifecycle, 'deprecated');
    assert.equal(registry.unregister('user-session'), true);
  });
});

describe('PolicyComposer', () => {
  it('composes hierarchical policy tree', () => {
    const composer = new PolicyComposer(seedRegistry());
    const tree = composer.compose({
      global: undefined,
      organization: 'org-1',
      department: undefined,
      project: 'proj-1',
      application: undefined,
      user: undefined,
      session: 'sess-1',
    });
    assert.ok(tree.layers.global.length >= 1);
    assert.ok(tree.layers.organization.length >= 1);
    assert.ok(tree.layers.project.length >= 1);
    assert.ok(tree.documents.length >= 3);
  });
});

describe('PolicyResolver', () => {
  it('resolves applicable inherited and active policies', () => {
    const registry = seedRegistry();
    const composer = new PolicyComposer(registry);
    const resolver = new PolicyResolver();
    const scope = {
      global: undefined,
      organization: 'org-1',
      department: undefined,
      project: 'proj-1',
      application: undefined,
      user: undefined,
      session: 'sess-1',
    };
    const tree = composer.compose(scope);
    const resolved = resolver.resolve(
      {
        requestId: 'r1',
        scope,
        subject: { userId: 'u1' },
        resource: 'knowledge',
        traceId: 't1',
      },
      tree,
    );
    assert.ok(resolved.applicable.length > 0);
    assert.ok(resolved.active.length > 0);
    assert.ok(resolved.inherited.length > 0);
  });
});

describe('PolicyConflictResolver', () => {
  it('picks most restrictive conflicting rule', () => {
    const resolver = new PolicyConflictResolver(new ConfigService());
    const rules = resolver.resolve([
      {
        id: 'allow',
        effect: 'allow',
        action: 'write',
        resource: 'knowledge',
        priority: 10,
        restrictiveness: 10,
      },
      {
        id: 'deny',
        effect: 'deny',
        action: 'write',
        resource: 'knowledge',
        priority: 5,
        restrictiveness: 80,
      },
    ]);
    assert.equal(rules.length, 1);
    assert.equal(rules[0]?.effect, 'deny');
  });
});

describe('EffectivePolicyBuilder + Provider', () => {
  it('builds immutable effective policy', () => {
    const builder = new EffectivePolicyBuilder();
    const docs = createBuiltinPolicies().filter((d) => d.policyId === 'global-baseline');
    const effective = builder.build(
      {
        requestId: 'r2',
        scope: {
          global: undefined,
          organization: undefined,
          department: undefined,
          project: undefined,
          application: undefined,
          user: undefined,
          session: undefined,
        },
        subject: {},
        resource: '*',
        traceId: 't2',
      },
      docs[0]!.rules,
      docs,
    );
    assert.equal(effective.requestId, 'r2');
    assert.ok(effective.version.startsWith('ep-'));
    assert.ok(effective.permissions.includes('read:*'));
  });

  it('memory provider stores and lists', () => {
    const provider = new MemoryPolicyProvider();
    const doc = createBuiltinPolicies()[0]!;
    provider.save(doc);
    assert.equal(provider.get(doc.policyId)?.name, doc.name);
    assert.equal(provider.list('global').length, 1);
  });
});
