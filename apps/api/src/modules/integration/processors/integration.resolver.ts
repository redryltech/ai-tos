import { Inject, Injectable } from '@nestjs/common';
import {
  INTEGRATION_REGISTRY,
  type IIntegrationRegistry,
  type IIntegrationResolver,
} from '../contracts';

/**
 * Integration Resolver — availability/config/constraints.
 * Never performs communication.
 */
@Injectable()
export class IntegrationResolver implements IIntegrationResolver {
  constructor(
    @Inject(INTEGRATION_REGISTRY) private readonly registry: IIntegrationRegistry,
  ) {}

  resolve(
    connectorId: string,
    operation: string,
  ): {
    readonly available: boolean;
    readonly registration?: ReturnType<IIntegrationRegistry['get']>;
    readonly reason: string;
  } {
    if (!connectorId || typeof connectorId !== 'string') {
      return Object.freeze({ available: false, reason: 'connectorId_required' });
    }
    if (!operation || typeof operation !== 'string') {
      return Object.freeze({ available: false, reason: 'operation_required' });
    }

    const registration = this.registry.get(connectorId);
    if (!registration) {
      return Object.freeze({ available: false, reason: 'not_registered' });
    }
    if (!registration.available) {
      return Object.freeze({
        available: false,
        registration,
        reason: 'unavailable',
      });
    }
    if (registration.descriptor.lifecycle === 'disabled') {
      return Object.freeze({
        available: false,
        registration,
        reason: 'disabled',
      });
    }

    return Object.freeze({
      available: true,
      registration,
      reason: 'ok',
    });
  }
}
