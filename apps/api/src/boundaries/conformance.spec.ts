import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COGNITIVE_PRODUCT_ADJACENT_MODULES,
  MODULE_OWNERSHIP,
  ownershipOf,
} from './module-ownership';

describe('architecture conformance seams', () => {
  it('classifies cognitive modules as product-adjacent, not Platform SA owners', () => {
    for (const name of COGNITIVE_PRODUCT_ADJACENT_MODULES) {
      const row = ownershipOf(name);
      assert.ok(row, `missing ownership row for ${name}`);
      assert.equal(row!.ownership, 'COGNITIVE_PRODUCT_ADJACENT');
      assert.match(row!.authority, /Not SA Platform/);
    }
  });

  it('keeps Persistence ≠ Memory: memory is not SHARED_INFRA durable representation', () => {
    const memory = ownershipOf('memory');
    const audit = ownershipOf('audit-logs');
    assert.equal(memory?.ownership, 'COGNITIVE_PRODUCT_ADJACENT');
    assert.equal(audit?.ownership, 'PLATFORM');
    assert.match(memory!.notes, /Persistence/);
  });

  it('keeps Access ≠ Business Decision: rbac PLATFORM vs decision product-adjacent', () => {
    assert.equal(ownershipOf('rbac')?.ownership, 'PLATFORM');
    assert.equal(ownershipOf('decision')?.ownership, 'COGNITIVE_PRODUCT_ADJACENT');
    assert.match(ownershipOf('decision')!.notes, /Business Decision/);
  });

  it('keeps Integration ≠ Orchestration', () => {
    const integration = ownershipOf('integration');
    assert.equal(integration?.ownership, 'PLATFORM');
    assert.match(integration!.notes, /Integration ≠ Orchestration/);
  });

  it('keeps Security/Audit ≠ Identity/Observability split', () => {
    assert.equal(ownershipOf('auth')?.ownership, 'PLATFORM');
    assert.equal(ownershipOf('audit-logs')?.ownership, 'PLATFORM');
    assert.match(ownershipOf('logging')!.notes, /Observability ≠ Audit/);
    assert.match(ownershipOf('audit-logs')!.notes, /Audit ≠ Observability/);
  });

  it('keeps Execution stack split (workflow ≠ parallel-executor ≠ reliability)', () => {
    const exec = ['workflow', 'task-manager', 'parallel-executor', 'reliability', 'streaming', 'finalizer'];
    for (const name of exec) {
      assert.equal(ownershipOf(name)?.ownership, 'EXECUTION_RUNTIME', name);
    }
    assert.match(ownershipOf('workflow')!.notes, /construction ≠ Runtime/);
    assert.match(ownershipOf('reliability')!.notes, /≠ universal orchestration/);
  });

  it('does not invent SA-016 or Universal owners in the ownership map', () => {
    for (const row of MODULE_OWNERSHIP) {
      assert.equal(row.authority.includes('SA-016'), false, row.module);
      assert.equal(
        /Universal (Orchestrator|Decision|Memory|Workflow)/i.test(row.authority),
        false,
        row.module,
      );
    }
  });

  it('marks event-bus transport as local/dev default (no broker selection)', () => {
    assert.match(ownershipOf('event-bus')!.notes, /in-process transport is local\/dev/);
  });

  it('marks kernel as ephemeral shared infra, not universal state owner', () => {
    assert.match(ownershipOf('kernel')!.notes, /≠ universal state owner/);
  });
});
