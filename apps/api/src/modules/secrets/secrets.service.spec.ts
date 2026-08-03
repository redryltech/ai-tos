import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EnvSecretProvider } from './env-secret.provider';
import { MemorySecretProvider } from './memory-secret.provider';
import { SecretsService } from './secrets.service';

describe('SecretsService', () => {
  let service: SecretsService;

  beforeEach(() => {
    const config = new ConfigService();
    service = new SecretsService(config, new EnvSecretProvider(config), new MemorySecretProvider());
    service.onModuleInit();
  });

  it('retrieves JWT secrets from env provider', async () => {
    const access = await service.getJwtAccessSecret();
    assert.ok(access.reveal().length >= 16);
    assert.match(access.toString(), /REDACTED/);
  });

  it('retrieves encryption key for API keys', async () => {
    const enc = await service.getApiKeyEncryptionSecret();
    assert.ok(enc.reveal().length >= 32);
  });

  it('rotates secret into runtime overlay and updates metadata', async () => {
    const ref = { kind: 'jwt_secret' as const, name: 'access' };
    const before = await service.getSecret(ref);
    const meta = await service.rotateSecret(ref, 'rotated-dev-secret-value-ok');
    assert.equal(meta.source, 'runtime');
    assert.ok(meta.version >= 1);
    const after = await service.getSecret(ref);
    assert.equal(after.reveal(), 'rotated-dev-secret-value-ok');
    assert.notEqual(after.reveal(), before.reveal());
  });

  it('lists metadata without exposing plaintext', async () => {
    const list = await service.listMetadata('jwt_secret');
    assert.ok(list.length >= 2);
    for (const item of list) {
      assert.equal(item.kind, 'jwt_secret');
      assert.equal(item.last4.length, 4);
      assert.ok(!('value' in item));
    }
  });
});
