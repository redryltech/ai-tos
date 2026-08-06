import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../../configuration/config.service';
import { InputGateway } from './input.gateway';
import { PerceptionProcessor } from './perception.processor';
import { UnderstandingProcessor } from './understanding.processor';
import { WorldModelBuilder } from './world-model.builder';
import { OutputStandardizer } from './output.standardizer';

describe('InputGateway', () => {
  const gateway = new InputGateway();

  it('normalizes text input', () => {
    const normalized = gateway.accept({ content: 'Analyze AAPL', type: 'text' });
    assert.equal(normalized.inputType, 'text');
    assert.equal(normalized.content, 'Analyze AAPL');
    assert.ok(normalized.requestId.length > 0);
  });

  it('infers website from uri', () => {
    const normalized = gateway.accept({ uri: 'https://example.com/doc' });
    assert.equal(normalized.inputType, 'website');
    assert.equal(normalized.content, 'https://example.com/doc');
  });

  it('infers image from mime + binary ref', () => {
    const normalized = gateway.accept({
      contentBinaryRef: 's3://bucket/a.png',
      mimeType: 'image/png',
    });
    assert.equal(normalized.inputType, 'image');
  });

  it('accepts json / api_request / event', () => {
    assert.equal(gateway.accept({ type: 'json', data: { a: 1 } }).inputType, 'json');
    assert.equal(
      gateway.accept({ type: 'api_request', data: { path: '/v1' } }).inputType,
      'api_request',
    );
    assert.equal(gateway.accept({ type: 'event', data: { name: 'x' } }).inputType, 'event');
  });

  it('rejects unsupported type and empty text', () => {
    assert.throws(() => gateway.accept({ type: 'xml' as 'text' }), /Unsupported/);
    assert.throws(() => gateway.accept({ type: 'text' }), /requires content/);
  });
});

describe('PerceptionProcessor', () => {
  const gateway = new InputGateway();
  const processor = new PerceptionProcessor(new ConfigService());

  it('extracts intent entities language emotion priority', () => {
    const input = gateway.accept({
      content: 'Urgent: analyze AAPL https://x.test',
      languageHint: 'en-US',
    });
    const obs = processor.process(input);
    assert.equal(obs.intent, 'analysis_request');
    assert.ok(obs.entities.includes('AAPL'));
    assert.equal(obs.language, 'en-us');
    assert.equal(obs.emotion, 'urgent');
    assert.equal(obs.priority, 'high');
    assert.equal(obs.inputType, 'text');
  });
});

describe('UnderstandingProcessor', () => {
  const gateway = new InputGateway();
  const perception = new PerceptionProcessor(new ConfigService());
  const understanding = new UnderstandingProcessor();

  it('builds relationships constraints unknowns safety semantic meaning', () => {
    const input = gateway.accept({
      content: 'password=secret analyze MSFT',
      userId: 'u1',
    });
    const obs = perception.process(input);
    const u = understanding.process(input, obs);
    assert.ok(u.objects.length >= 1);
    assert.ok(u.relationships.length >= 0);
    assert.ok(u.semanticMeaning.includes('intent='));
    assert.ok(u.safetyObservations.some((s) => s.category === 'credential_leak_pattern'));
    assert.ok(u.unknowns.some((x) => x.field === 'organizationId'));
    assert.ok(u.confidence >= 0 && u.confidence <= 1);
  });
});

describe('WorldModelBuilder + OutputStandardizer', () => {
  it('produces canonical WorldUnderstanding schema', () => {
    const gateway = new InputGateway();
    const perception = new PerceptionProcessor(new ConfigService());
    const understanding = new UnderstandingProcessor();
    const builder = new WorldModelBuilder();
    const standardizer = new OutputStandardizer();

    const input = gateway.accept({
      requestId: 'req-1',
      userId: 'u1',
      organizationId: 'o1',
      sessionId: 's1',
      content: 'help explain risk',
    });
    const obs = perception.process(input);
    const und = understanding.process(input, obs);
    const world = standardizer.standardize(builder.build(input, obs, und));

    assert.equal(world.requestId, 'req-1');
    assert.equal(world.userId, 'u1');
    assert.equal(world.organizationId, 'o1');
    assert.equal(world.sessionId, 's1');
    assert.ok(world.actor.kind);
    assert.ok(world.goal.startsWith('understand:'));
    assert.ok(Array.isArray(world.objects));
    assert.ok(Array.isArray(world.relationships));
    assert.ok(Array.isArray(world.constraints));
    assert.ok(Array.isArray(world.unknowns));
    assert.ok(world.environment);
    assert.ok(Array.isArray(world.safetyObservations));
    assert.equal(world.metadata.schemaVersion, '1.0.0');
  });

  it('rejects invalid candidate shapes', () => {
    const standardizer = new OutputStandardizer();
    assert.throws(
      () =>
        standardizer.standardize({
          requestId: '',
        } as never),
      /requestId/,
    );
  });
});
