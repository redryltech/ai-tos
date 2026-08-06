import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import {
  CAPABILITY_RESOLVER,
  type ICapabilityResolver,
  type ICapabilityRouter,
} from '../contracts/capability.contracts';
import type {
  CapabilityImplementation,
  CapabilityName,
  CapabilityTier,
} from '../models/capability.models';

/**
 * Capability Router — select best capability implementation by tier/priority/availability.
 * Never knows model implementations or authenticates providers.
 */
@Injectable()
export class CapabilityRouter implements ICapabilityRouter {
  constructor(
    private readonly config: ConfigService,
    @Inject(CAPABILITY_RESOLVER) private readonly resolver: ICapabilityResolver,
  ) {}

  route(
    capability: CapabilityName,
    preferredTier?: CapabilityTier,
  ): CapabilityImplementation {
    const resolved = this.resolver.resolve(capability);
    if (!resolved.available || resolved.implementations.length === 0) {
      throw new Error(`Capability unavailable: ${capability} (${resolved.reason})`);
    }

    const preferred =
      preferredTier ?? this.config.capability.preferredTier;
    const orderedTiers: CapabilityTier[] = [
      preferred,
      ...(['local', 'cloud', 'enterprise'] as const).filter((t) => t !== preferred),
    ];

    for (const tier of orderedTiers) {
      const match = resolved.implementations
        .filter((i) => i.tier === tier && i.available)
        .sort((a, b) => b.priority - a.priority)[0];
      if (match) return match;
    }

    return resolved.implementations[0]!;
  }
}
