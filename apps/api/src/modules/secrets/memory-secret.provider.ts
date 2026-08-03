import { Injectable } from '@nestjs/common';
import type { SecretKind, SecretProvider, SecretRef } from './secret.types';
import { secretKey } from './secret.types';

interface RuntimeEntry {
  value: string;
  version: number;
  rotatedAt: Date;
}

/**
 * In-memory runtime secret store for rotation overlays and short-lived cache backing.
 * Not durable — suitable for process-local rotation until a vault provider is wired.
 */
@Injectable()
export class MemorySecretProvider implements SecretProvider {
  readonly id = 'memory';
  private readonly store = new Map<string, RuntimeEntry>();

  async get(ref: SecretRef): Promise<string | null> {
    return this.store.get(secretKey(ref))?.value ?? null;
  }

  async put(ref: SecretRef, value: string): Promise<void> {
    const key = secretKey(ref);
    const prev = this.store.get(key);
    this.store.set(key, {
      value,
      version: (prev?.version ?? 0) + 1,
      rotatedAt: new Date(),
    });
  }

  async list(kind?: SecretKind): Promise<Array<{ kind: SecretKind; name: string; source: 'env' | 'runtime' }>> {
    const out: Array<{ kind: SecretKind; name: string; source: 'env' | 'runtime' }> = [];
    for (const key of this.store.keys()) {
      const [knd, name] = key.split(':') as [SecretKind, string];
      if (kind && knd !== kind) continue;
      out.push({ kind: knd, name, source: 'runtime' });
    }
    return out;
  }

  getVersion(ref: SecretRef): number {
    return this.store.get(secretKey(ref))?.version ?? 0;
  }

  getRotatedAt(ref: SecretRef): Date | null {
    return this.store.get(secretKey(ref))?.rotatedAt ?? null;
  }

  clearCacheKey(ref: SecretRef): void {
    this.store.delete(secretKey(ref));
  }
}
