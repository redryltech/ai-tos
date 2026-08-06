import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { ContextManagerService } from './context-manager.service';
import { MemoryContextStore } from './storage/memory-context.store';

describe('ContextManagerService', () => {
  let ctx: ContextManagerService;
  let events: string[];

  beforeEach(() => {
    const config = new ConfigService();
    const bus = new EventBusService(config);
    bus.clear();
    events = [];
    bus.subscribe('kernel.context.#', (e) => {
      events.push(e.topic);
    });
    ctx = new ContextManagerService(config, bus, new MemoryContextStore());
  });

  it('propagates request/user/org context across async work', async () => {
    await ctx.runWithContext(
      {
        request: { requestId: 'req-1', correlationId: 'corr-1' },
        user: { userId: 'u-1', roles: ['admin'] },
        organization: { organizationId: 'org-1', slug: 'acme' },
      },
      async () => {
        assert.equal(ctx.getRequest()?.requestId, 'req-1');
        assert.equal(ctx.getUser()?.userId, 'u-1');
        assert.equal(ctx.getOrganization()?.organizationId, 'org-1');
        await Promise.resolve();
        assert.equal(ctx.getRequest()?.correlationId, 'corr-1');
      },
    );
    assert.equal(ctx.getRequest(), undefined);
    assert.ok(events.includes('kernel.context.bound'));
  });

  it('supports pipeline and worker contexts', () => {
    ctx.runWithContext(
      {
        pipeline: { pipelineId: 'pipe-1', stage: 'ingest' },
        worker: { workerId: 'w-1', queue: 'default' },
      },
      () => {
        assert.equal(ctx.getPipeline()?.stage, 'ingest');
        assert.equal(ctx.getWorker()?.workerId, 'w-1');
        ctx.setAttribute('trace', true);
        assert.equal(ctx.getContext().attributes?.trace, true);
      },
    );
  });

  it('forks a portable snapshot for propagation', () => {
    const snapshot = ctx.runWithContext(
      {
        request: { requestId: 'req-2' },
        user: { userId: 'u-2' },
      },
      () => ctx.fork({ worker: { workerId: 'w-2' } }),
    );

    assert.equal(snapshot.request?.requestId, 'req-2');
    assert.equal(snapshot.user?.userId, 'u-2');
    assert.equal(snapshot.worker?.workerId, 'w-2');

    ctx.runWithContext(snapshot, () => {
      assert.equal(ctx.getWorker()?.workerId, 'w-2');
      assert.equal(ctx.getRequest()?.requestId, 'req-2');
    });
  });

  it('ensureRequest creates a requestId when missing', () => {
    ctx.runWithContext({}, () => {
      const req = ctx.ensureRequest({ path: '/api/health' });
      assert.ok(req.requestId.length > 0);
      assert.equal(ctx.getRequest()?.path, '/api/health');
    });
  });

  it('merges updates into the active context', () => {
    ctx.runWithContext({ request: { requestId: 'r' } }, () => {
      ctx.setUser({ userId: 'u' });
      ctx.setOrganization({ organizationId: 'o' });
      assert.equal(ctx.getRequest()?.requestId, 'r');
      assert.equal(ctx.getUser()?.userId, 'u');
      assert.equal(ctx.getOrganization()?.organizationId, 'o');
      assert.ok(events.includes('kernel.context.updated'));
    });
  });
});
