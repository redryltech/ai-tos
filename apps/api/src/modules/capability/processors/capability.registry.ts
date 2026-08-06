import { Injectable } from '@nestjs/common';
import type { ICapabilityRegistry } from '../contracts/capability.contracts';
import type {
  CapabilityDescriptor,
  CapabilityImplementation,
  CapabilityName,
} from '../models/capability.models';

/**
 * Capability Registry — dynamic registration/discovery/metadata/lifecycle.
 * Never executes capabilities.
 */
@Injectable()
export class CapabilityRegistry implements ICapabilityRegistry {
  private readonly byId = new Map<string, CapabilityImplementation>();

  register(implementation: CapabilityImplementation): void {
    if (!implementation?.id || !implementation.capability) {
      throw new Error('CapabilityImplementation id and capability are required');
    }
    this.byId.set(
      implementation.id,
      Object.freeze({
        ...implementation,
        descriptor: Object.freeze({ ...implementation.descriptor }),
      }),
    );
  }

  unregister(implementationId: string): boolean {
    return this.byId.delete(implementationId);
  }

  get(implementationId: string): CapabilityImplementation | undefined {
    return this.byId.get(implementationId);
  }

  list(capability?: CapabilityName): readonly CapabilityImplementation[] {
    const all = [...this.byId.values()];
    const filtered = capability
      ? all.filter((i) => i.capability === capability)
      : all;
    return Object.freeze(
      filtered.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)),
    );
  }

  listDescriptors(): readonly CapabilityDescriptor[] {
    const byName = new Map<string, CapabilityDescriptor>();
    for (const impl of this.byId.values()) {
      if (!byName.has(impl.capability)) {
        byName.set(impl.capability, impl.descriptor);
      }
    }
    return Object.freeze([...byName.values()]);
  }

  setAvailable(implementationId: string, available: boolean): void {
    const existing = this.byId.get(implementationId);
    if (!existing) throw new Error(`Unknown capability implementation: ${implementationId}`);
    this.byId.set(
      implementationId,
      Object.freeze({
        ...existing,
        available,
        descriptor: Object.freeze({ ...existing.descriptor }),
      }),
    );
  }
}
