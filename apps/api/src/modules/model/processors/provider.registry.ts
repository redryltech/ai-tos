import { Injectable } from '@nestjs/common';
import type { IProviderRegistry } from '../contracts';
import type {
  ProviderDescriptor,
  ProviderRegistration,
} from '../models/model.models';

/** Provider Registry — discovery/metadata/lifecycle. Never executes inference. */
@Injectable()
export class ProviderRegistry implements IProviderRegistry {
  private readonly providers = new Map<string, ProviderRegistration>();

  register(registration: ProviderRegistration): void {
    this.providers.set(
      registration.descriptor.providerId,
      Object.freeze({
        descriptor: registration.descriptor,
        adapterId: registration.adapterId,
        available: registration.available,
      }),
    );
  }

  unregister(providerId: string): boolean {
    return this.providers.delete(providerId);
  }

  get(providerId: string): ProviderRegistration | undefined {
    return this.providers.get(providerId);
  }

  list(): readonly ProviderRegistration[] {
    return Object.freeze([...this.providers.values()]);
  }

  listDescriptors(): readonly ProviderDescriptor[] {
    return Object.freeze([...this.providers.values()].map((p) => p.descriptor));
  }

  setAvailable(providerId: string, available: boolean): void {
    const existing = this.providers.get(providerId);
    if (!existing) return;
    this.providers.set(
      providerId,
      Object.freeze({
        ...existing,
        available,
      }),
    );
  }
}
