import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  it('exposes typed configuration sections', () => {
    const config = new ConfigService();
    assert.ok(config.app.name);
    assert.ok(['development', 'testing', 'staging', 'production'].includes(config.app.environment));
    assert.equal(typeof config.api.port, 'number');
    assert.ok(config.database.url);
    assert.ok(config.redis.url);
    assert.ok(config.ai.serviceUrl);
    assert.ok(config.security.jwtSecret);
    assert.ok(config.monitoring.otelServiceName);
    assert.equal(config.all.app.name, config.app.name);
  });
});
