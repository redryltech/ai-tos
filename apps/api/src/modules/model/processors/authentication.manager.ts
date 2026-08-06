import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IAuthenticationManager } from '../contracts';
import type { ProviderCredential } from '../models/model.models';

/**
 * Authentication Manager — credential store/validate/refresh.
 * Never selects providers. Does not call external identity providers.
 */
@Injectable()
export class AuthenticationManager implements IAuthenticationManager {
  private readonly credentials = new Map<string, ProviderCredential>();

  constructor(private readonly config: ConfigService) {}

  store(credential: ProviderCredential): void {
    this.credentials.set(
      credential.providerId,
      Object.freeze({
        providerId: credential.providerId,
        mode: credential.mode,
        secretRef: credential.secretRef,
        expiresAt: credential.expiresAt,
        metadata: Object.freeze({ ...(credential.metadata ?? {}) }),
      }),
    );
  }

  get(providerId: string): ProviderCredential | undefined {
    return this.credentials.get(providerId);
  }

  validate(providerId: string): boolean {
    const credential = this.credentials.get(providerId);
    if (!credential) return false;
    if (!credential.secretRef || credential.secretRef.trim().length === 0) {
      return false;
    }
    if (credential.expiresAt !== undefined && credential.expiresAt <= Date.now()) {
      return false;
    }
    return true;
  }

  refresh(providerId: string): ProviderCredential | undefined {
    const existing = this.credentials.get(providerId);
    if (!existing) return undefined;
    const refreshed: ProviderCredential = Object.freeze({
      ...existing,
      secretRef: `${existing.secretRef}:refreshed`,
      expiresAt: Date.now() + 3_600_000,
      metadata: Object.freeze({
        ...(existing.metadata ?? {}),
        refreshedAt: Date.now(),
        authMode: this.config.model.authMode,
      }),
    });
    this.credentials.set(providerId, refreshed);
    return refreshed;
  }

  remove(providerId: string): boolean {
    return this.credentials.delete(providerId);
  }
}
