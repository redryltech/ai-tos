import { Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import type { SecretKind, SecretProvider, SecretRef } from './secret.types';

/**
 * Environment-backed secret provider (ConfigService / PlatformConfig).
 * Production-safe reads of JWT, encryption, and optional AI provider env secrets.
 */
@Injectable()
export class EnvSecretProvider implements SecretProvider {
  readonly id = 'env';

  constructor(private readonly config: ConfigService) {}

  async get(ref: SecretRef): Promise<string | null> {
    const map = this.envMap();
    return map.get(this.key(ref)) ?? null;
  }

  async list(kind?: SecretKind): Promise<Array<{ kind: SecretKind; name: string; source: 'env' | 'runtime' }>> {
    const entries = [...this.envMap().keys()];
    return entries
      .map((k) => {
        const [knd, name] = k.split(':') as [SecretKind, string];
        return { kind: knd, name, source: 'env' as const };
      })
      .filter((e) => (kind ? e.kind === kind : true));
  }

  /** Sync peek for startup validation (no network / async I/O). */
  peek(ref: SecretRef): string | null {
    return this.envMap().get(this.key(ref)) ?? null;
  }

  private key(ref: SecretRef): string {
    return `${ref.kind}:${ref.name}`;
  }

  private envMap(): Map<string, string> {
    const security = this.config.security;
    const map = new Map<string, string>();

    map.set('jwt_secret:access', security.jwtSecret);
    map.set('jwt_secret:refresh', security.jwtRefreshSecret);
    map.set('encryption_key:api_keys', security.apiKeyEncryptionSecret);

    // Optional AI provider secrets from process.env (never logged).
    const aiProviders = [
      'openai',
      'google_gemini',
      'anthropic_claude',
      'market_data',
      'broker',
      'email',
      'telegram_bot',
      'webhook',
      'custom',
    ] as const;

    for (const provider of aiProviders) {
      const envName = `AI_PROVIDER_SECRET_${provider.toUpperCase()}`;
      const value = process.env[envName];
      if (value && value.length > 0) {
        map.set(`ai_provider_secret:${provider}`, value);
      }
    }

    // Generic API key material for platform integrations (optional).
    if (process.env.PLATFORM_API_KEY) {
      map.set('api_key:platform', process.env.PLATFORM_API_KEY);
    }

    return map;
  }
}
