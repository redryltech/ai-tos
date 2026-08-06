import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import { InMemoryMemoryProvider } from '../providers/in-memory.memory.provider';
import { EpisodicMemory } from './episodic.memory';
import { LongTermMemory } from './long-term.memory';
import { MemoryController } from './memory.controller';
import { MemoryEvaluator } from './memory.evaluator';
import { SessionMemory } from './session.memory';

function createController(): {
  controller: MemoryController;
  provider: InMemoryMemoryProvider;
  evaluator: MemoryEvaluator;
} {
  const config = new ConfigService();
  const provider = new InMemoryMemoryProvider(config.memory.maxEntries);
  const evaluator = new MemoryEvaluator(config);
  const session = new SessionMemory(provider);
  const longTerm = new LongTermMemory(provider);
  const episodic = new EpisodicMemory(provider);
  const controller = new MemoryController(
    evaluator,
    session,
    longTerm,
    episodic,
    provider,
  );
  return { controller, provider, evaluator };
}

describe('MemoryEvaluator', () => {
  const evaluator = new MemoryEvaluator(new ConfigService());

  it('discards greetings and noise', () => {
    const result = evaluator.evaluate({ content: 'Hello' });
    assert.equal(result.store, false);
    assert.ok(result.discardReason);
  });

  it('classifies preference as long_term', () => {
    const result = evaluator.evaluate({
      content: 'User always prefers Python for scripting',
    });
    assert.equal(result.store, true);
    assert.equal(result.kind, 'long_term');
  });

  it('classifies failures as episodic', () => {
    const result = evaluator.evaluate({
      content: 'Execution failed with timeout; lesson learned: increase budget',
    });
    assert.equal(result.store, true);
    assert.equal(result.kind, 'episodic');
  });

  it('defaults conversational context to session', () => {
    const result = evaluator.evaluate({
      content: 'Current workflow step is validating input schema',
    });
    assert.equal(result.store, true);
    assert.equal(result.kind, 'session');
  });
});

describe('Session / Long-term / Episodic stores', () => {
  it('routes kind-specific stores and recalls', async () => {
    const { controller } = createController();

    const session = await controller.remember({
      content: 'Temporary workflow context for chart rendering',
      sessionId: 's1',
      userId: 'u1',
    });
    assert.ok(session);
    assert.equal(session!.kind, 'session');

    const longTerm = await controller.remember({
      content: 'I always prefer dark mode',
      userId: 'u1',
    });
    assert.equal(longTerm!.kind, 'long_term');

    const episodic = await controller.remember({
      content: 'Task completed successfully after retry',
      userId: 'u1',
    });
    assert.equal(episodic!.kind, 'episodic');

    const sessionRecall = await controller.recall({ kind: 'session', sessionId: 's1' });
    assert.ok(sessionRecall.items.some((i) => i.id === session!.id));

    const ltRecall = await controller.recall({ kind: 'long_term', userId: 'u1' });
    assert.ok(ltRecall.items.some((i) => i.id === longTerm!.id));

    const epRecall = await controller.recall({ kind: 'episodic', userId: 'u1' });
    assert.ok(epRecall.items.some((i) => i.id === episodic!.id));
  });
});

describe('Memory lifecycle via controller', () => {
  it('update archive forget search', async () => {
    const { controller } = createController();
    const remembered = await controller.remember({
      content: 'Organization prefers UTC timestamps',
      organizationId: 'o1',
    });
    assert.ok(remembered);

    const updated = await controller.update({
      id: remembered!.id,
      summary: 'UTC preference',
      tags: ['preference'],
    });
    assert.equal(updated.summary, 'UTC preference');

    await controller.archive(remembered!.id);
    const archived = await controller.search({
      text: 'UTC',
      includeArchived: true,
    });
    assert.ok(archived.items.some((i) => i.status === 'archived'));

    await controller.forget(remembered!.id);
    const afterForget = await controller.search({
      text: 'UTC',
      includeArchived: true,
    });
    assert.equal(
      afterForget.items.some((i) => i.id === remembered!.id),
      false,
    );
  });

  it('discards hello without storing', async () => {
    const { controller, provider } = createController();
    const result = await controller.remember({ content: 'Hello' });
    assert.equal(result, null);
    const all = await provider.findMany({ limit: 10, status: ['active', 'archived'] });
    assert.equal(all.total, 0);
  });
});

describe('InMemoryMemoryProvider', () => {
  it('enforces max entries and text filter', async () => {
    const provider = new InMemoryMemoryProvider(2);
    const base = {
      kind: 'session' as const,
      status: 'active' as const,
      content: 'a',
      summary: 'a',
      tags: [] as const,
      importance: 'normal' as const,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0' as const,
    };
    await provider.save({ ...base, id: '1', content: 'alpha experience' });
    await provider.save({ ...base, id: '2', content: 'beta experience' });
    await provider.save({ ...base, id: '3', content: 'gamma experience' });
    assert.equal((await provider.findById('1')) == null, true);
    const found = await provider.findMany({ text: 'gamma' });
    assert.equal(found.total, 1);
  });
});
