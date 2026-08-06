import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { CommunicationManagerService } from './communication-manager.service';

describe('CommunicationManagerService', () => {
  let cm: CommunicationManagerService;
  let events: string[];

  beforeEach(() => {
    const config = new ConfigService();
    const bus = new EventBusService(config);
    bus.clear();
    events = [];
    bus.subscribe('kernel.comm.#', (e) => {
      events.push(e.topic);
    });
    cm = new CommunicationManagerService(config, bus);
    cm.clear();
  });

  it('registers service and worker endpoints', () => {
    const svc = cm.registerEndpoint('service', 'scheduler');
    const worker = cm.registerEndpoint('worker', 'worker-1');
    assert.equal(svc.kind, 'service');
    assert.equal(worker.kind, 'worker');
    assert.equal(cm.listEndpoints('service').length, 1);
    assert.ok(events.includes('kernel.comm.endpoint.registered'));
  });

  it('supports point-to-point messaging', async () => {
    const a = cm.registerEndpoint('service', 'a');
    const b = cm.registerEndpoint('service', 'b');
    const received: unknown[] = [];
    cm.subscribe('tasks', ({ message }) => {
      received.push(message.payload);
    });

    await cm.send({ from: a.id, to: b.id, channel: 'tasks', payload: { n: 1 } });
    assert.deepEqual(received, [{ n: 1 }]);
    assert.ok(events.includes('kernel.comm.message.sent'));
  });

  it('routes service and worker messaging', async () => {
    const svc = cm.registerEndpoint('service', 'api');
    const worker = cm.registerEndpoint('worker', 'w1');
    const got: string[] = [];
    cm.subscribe('jobs', ({ message }) => {
      got.push(String(message.to));
    });

    await cm.sendToWorker({ from: svc.id, to: worker.id, channel: 'jobs', payload: 'go' });
    await cm.sendToService({ from: worker.id, to: svc.id, channel: 'jobs', payload: 'done' });
    assert.deepEqual(got, [worker.id, svc.id]);
    await assert.rejects(
      () => cm.sendToWorker({ from: svc.id, to: svc.id, channel: 'jobs', payload: 1 }),
      /not a worker/,
    );
  });

  it('broadcasts to matching endpoints', async () => {
    const hub = cm.registerEndpoint('service', 'hub');
    const w1 = cm.registerEndpoint('worker', 'w1');
    const w2 = cm.registerEndpoint('worker', 'w2');
    cm.registerEndpoint('service', 'other');
    const targets: string[] = [];
    cm.subscribe('announce', ({ message }) => {
      if (message.to) targets.push(message.to);
    });

    const sent = await cm.broadcast({
      from: hub.id,
      channel: 'announce',
      payload: { hello: true },
      targetKind: 'worker',
    });
    assert.equal(sent.length, 2);
    assert.ok(targets.includes(w1.id));
    assert.ok(targets.includes(w2.id));
    assert.ok(events.includes('kernel.comm.broadcast'));
  });

  it('supports request/response routing', async () => {
    const client = cm.registerEndpoint('service', 'client');
    const server = cm.registerEndpoint('service', 'server');

    cm.subscribe('rpc', async ({ message, reply }) => {
      if (message.kind === 'request') {
        await reply({ echo: message.payload });
      }
    });

    const response = await cm.request({
      from: client.id,
      to: server.id,
      channel: 'rpc',
      payload: { q: 42 },
      timeoutMs: 1000,
    });

    assert.equal(response.kind, 'response');
    assert.deepEqual(response.payload, { echo: { q: 42 } });
    assert.ok(events.includes('kernel.comm.request'));
    assert.ok(events.includes('kernel.comm.response'));
  });

  it('times out unanswered requests', async () => {
    const a = cm.registerEndpoint('service', 'a');
    const b = cm.registerEndpoint('service', 'b');
    await assert.rejects(
      () =>
        cm.request({
          from: a.id,
          to: b.id,
          channel: 'missing',
          payload: null,
          timeoutMs: 20,
        }),
      /timed out/,
    );
  });

  it('reports stats', async () => {
    const a = cm.registerEndpoint('service', 'a');
    const b = cm.registerEndpoint('worker', 'b');
    await cm.send({ from: a.id, to: b.id, channel: 'x', payload: 1 });
    const stats = cm.stats();
    assert.equal(stats.services, 1);
    assert.equal(stats.workers, 1);
    assert.equal(stats.messagesSent, 1);
  });
});
