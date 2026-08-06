import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IIntegrationRegistry } from '../contracts';
import type {
  ConnectorDescriptor,
  ConnectorRegistration,
} from '../models/integration.models';

/** Integration Registry — discovery/metadata/lifecycle. Never communicates externally. */
@Injectable()
export class IntegrationRegistry implements IIntegrationRegistry {
  private readonly connectors = new Map<string, ConnectorRegistration>();

  constructor(private readonly config: ConfigService) {}

  register(registration: ConnectorRegistration): void {
    if (!this.config.integration.registrationEnabled) {
      throw new Error('Connector registration is disabled');
    }
    this.connectors.set(
      registration.descriptor.connectorId,
      Object.freeze({
        descriptor: registration.descriptor,
        adapterId: registration.adapterId,
        available: registration.available,
      }),
    );
  }

  unregister(connectorId: string): boolean {
    return this.connectors.delete(connectorId);
  }

  get(connectorId: string): ConnectorRegistration | undefined {
    return this.connectors.get(connectorId);
  }

  list(): readonly ConnectorRegistration[] {
    return Object.freeze([...this.connectors.values()]);
  }

  listDescriptors(): readonly ConnectorDescriptor[] {
    return Object.freeze(
      [...this.connectors.values()].map((c) => c.descriptor),
    );
  }

  setAvailable(connectorId: string, available: boolean): void {
    const existing = this.connectors.get(connectorId);
    if (!existing) return;
    this.connectors.set(
      connectorId,
      Object.freeze({
        ...existing,
        available,
      }),
    );
  }
}
