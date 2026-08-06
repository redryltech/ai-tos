import { Inject, Injectable } from '@nestjs/common';
import {
  CAPABILITY_REGISTRY,
  type ICapabilityRegistry,
  type ICapabilityResolver,
} from '../contracts/capability.contracts';
import type { CapabilityName } from '../models/capability.models';

/**
 * Capability Resolver — validate availability/requirements/compatibility.
 * Never selects AI providers.
 */
@Injectable()
export class CapabilityResolver implements ICapabilityResolver {
  constructor(
    @Inject(CAPABILITY_REGISTRY) private readonly registry: ICapabilityRegistry,
  ) {}

  resolve(capability: CapabilityName): {
    readonly available: boolean;
    readonly implementations: readonly import('../models/capability.models').CapabilityImplementation[];
    readonly reason: string;
  } {
    if (!capability || typeof capability !== 'string') {
      return Object.freeze({
        available: false,
        implementations: Object.freeze([]),
        reason: 'capability_name_required',
      });
    }

    const implementations = this.registry.list(capability);
    if (implementations.length === 0) {
      return Object.freeze({
        available: false,
        implementations,
        reason: 'capability_not_registered',
      });
    }

    const active = implementations.filter(
      (i) =>
        i.available &&
        (i.descriptor.lifecycle === 'active' || i.descriptor.lifecycle === 'registered'),
    );

    if (active.length === 0) {
      return Object.freeze({
        available: false,
        implementations,
        reason: 'capability_unavailable',
      });
    }

    return Object.freeze({
      available: true,
      implementations: Object.freeze(active),
      reason: 'capability_available',
    });
  }
}
