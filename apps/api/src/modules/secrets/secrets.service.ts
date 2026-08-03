import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import { EnvSecretProvider } from './env-secret.provider';
import { MemorySecretProvider } from './memory-secret.provider';
import {
  redactForLogs,
  SecretValue,
  secretKey,
  type SecretKind,
  type SecretMetadata,
  type SecretRef,
} from './secret.types';

interface CacheEntry {
  value: SecretValue;
  expiresAt: number;
}

const DEFAULT_CACHE_TTL_MS = 60_000;

/**
 * Enterprise secrets facade: secure retrieval, rotation overlay, in-memory cache.
 * Never logs plaintext secrets.
 */
@Injectable()
export class SecretsService implements OnModuleInit {
  private readonly logger = new Logger(SecretsService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs = DEFAULT_CACHE_TTL_MS;

  constructor(
    private readonly config: ConfigService,
    private readonly envProvider: EnvSecretProvider,
    private readonly memoryProvider: MemorySecretProvider,
  ) {}

  onModuleInit(): void {
    this.validateProductionReadiness();
    this.logger.log(
      `SecretsService ready (env=${this.config.app.environment}; cacheTtlMs=${this.cacheTtlMs})`,
    );
  }

  /** Secure retrieval — returns SecretValue that redacts on inspect/JSON. */
  async getSecret(ref: SecretRef): Promise<SecretValue> {
    this.assertValidRef(ref);
    const key = secretKey(ref);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const runtime = await this.memoryProvider.get(ref);
    if (runtime) {
      const version = this.memoryProvider.getVersion(ref);
      const secret = new SecretValue(runtime, version, ref.kind, ref.name);
      this.writeCache(key, secret);
      return secret;
    }

    const fromEnv = await this.envProvider.get(ref);
    if (!fromEnv) {
      this.logger.warn(`Secret not found: ${ref.kind}:${ref.name}`);
      throw new NotFoundException(`Secret not found: ${ref.kind}:${ref.name}`);
    }

    const secret = new SecretValue(fromEnv, 0, ref.kind, ref.name);
    this.writeCache(key, secret);
    return secret;
  }

  async getJwtAccessSecret(): Promise<SecretValue> {
    return this.getSecret({ kind: 'jwt_secret', name: 'access' });
  }

  async getJwtRefreshSecret(): Promise<SecretValue> {
    return this.getSecret({ kind: 'jwt_secret', name: 'refresh' });
  }

  async getApiKeyEncryptionSecret(): Promise<SecretValue> {
    return this.getSecret({ kind: 'encryption_key', name: 'api_keys' });
  }

  async getAiProviderSecret(provider: string): Promise<SecretValue> {
    return this.getSecret({ kind: 'ai_provider_secret', name: provider });
  }

  async getPlatformApiKey(): Promise<SecretValue> {
    return this.getSecret({ kind: 'api_key', name: 'platform' });
  }

  /**
   * Rotate a secret into the runtime overlay (process-local until vault backend).
   * Invalidates cache for the ref.
   */
  async rotateSecret(ref: SecretRef, newValue: string): Promise<SecretMetadata> {
    this.assertValidRef(ref);
    const trimmed = newValue.trim();
    if (trimmed.length < 8) {
      throw new BadRequestException('Rotated secret must be at least 8 characters');
    }
    if (this.requiresStrongSecrets() && trimmed.length < 32) {
      throw new BadRequestException(
        'Rotated secret must be at least 32 characters in staging/production',
      );
    }

    await this.memoryProvider.put(ref, trimmed);
    this.cache.delete(secretKey(ref));
    this.logger.log(`Secret rotated: ${ref.kind}:${ref.name} (value=${redactForLogs(trimmed)})`);
    return this.getMetadata(ref);
  }

  async getMetadata(ref: SecretRef): Promise<SecretMetadata> {
    const secret = await this.getSecret(ref);
    const rotatedAt = this.memoryProvider.getRotatedAt(ref);
    const runtimeVersion = this.memoryProvider.getVersion(ref);
    return {
      kind: ref.kind,
      name: ref.name,
      version: secret.version,
      last4: secret.last4,
      rotatedAt: rotatedAt ? rotatedAt.toISOString() : null,
      source: runtimeVersion > 0 ? 'runtime' : 'env',
    };
  }

  async listMetadata(kind?: SecretKind): Promise<SecretMetadata[]> {
    const refs = await this.collectKnownRefs(kind);
    const seen = new Set<string>();
    const result: SecretMetadata[] = [];
    for (const ref of refs) {
      const key = secretKey(ref);
      if (seen.has(key)) continue;
      seen.add(key);
      try {
        result.push(await this.getMetadata(ref));
      } catch {
        // skip unavailable optional secrets
      }
    }
    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async collectKnownRefs(kind?: SecretKind): Promise<SecretRef[]> {
    const refs: SecretRef[] = [
      { kind: 'jwt_secret', name: 'access' },
      { kind: 'jwt_secret', name: 'refresh' },
      { kind: 'encryption_key', name: 'api_keys' },
    ];

    if (process.env.PLATFORM_API_KEY) {
      refs.push({ kind: 'api_key', name: 'platform' });
    }

    const providers = [
      'openai',
      'google_gemini',
      'anthropic_claude',
      'market_data',
      'broker',
      'email',
      'telegram_bot',
      'webhook',
      'custom',
    ];
    for (const p of providers) {
      if (process.env[`AI_PROVIDER_SECRET_${p.toUpperCase()}`]) {
        refs.push({ kind: 'ai_provider_secret', name: p });
      }
    }

    for (const e of await this.memoryProvider.list(kind)) {
      refs.push({ kind: e.kind, name: e.name });
    }

    return refs.filter((r) => (kind ? r.kind === kind : true));
  }

  private writeCache(key: string, value: SecretValue): void {
    this.cache.set(key, { value, expiresAt: Date.now() + this.cacheTtlMs });
  }

  private assertValidRef(ref: SecretRef): void {
    if (!ref?.kind || !ref?.name) {
      throw new BadRequestException('Secret ref requires kind and name');
    }
  }

  private requiresStrongSecrets(): boolean {
    const env = this.config.app.environment;
    return env === 'staging' || env === 'production';
  }

  private validateProductionReadiness(): void {
    if (!this.requiresStrongSecrets()) return;

    const required: SecretRef[] = [
      { kind: 'jwt_secret', name: 'access' },
      { kind: 'jwt_secret', name: 'refresh' },
      { kind: 'encryption_key', name: 'api_keys' },
    ];

    for (const ref of required) {
      const value = this.envProvider.peek(ref);
      if (!value) {
        throw new Error(`Required secret missing at startup: ${ref.kind}:${ref.name}`);
      }
      this.logger.log(`Required secret present: ${ref.kind}:${ref.name} (${redactForLogs(value)})`);
    }
  }
}
