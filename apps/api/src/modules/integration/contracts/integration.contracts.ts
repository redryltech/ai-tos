import type { IntegrationRequestDto } from '../dto/integration.dto';
import type {
  ConnectionSession,
  ConnectorDescriptor,
  ConnectorRegistration,
  IntegrationAuthMode,
  IntegrationResult,
} from '../models/integration.models';
import type { IConnectorAdapter } from '../adapters/connector.adapter';

export const INTEGRATION_SERVICE = Symbol('INTEGRATION_SERVICE');
export const INTEGRATION_CONTROLLER = Symbol('INTEGRATION_CONTROLLER');
export const INTEGRATION_REGISTRY = Symbol('INTEGRATION_REGISTRY');
export const INTEGRATION_RESOLVER = Symbol('INTEGRATION_RESOLVER');
export const CONNECTION_LIFECYCLE_MANAGER = Symbol('CONNECTION_LIFECYCLE_MANAGER');
export const CONNECTOR_ADAPTERS = Symbol('CONNECTOR_ADAPTERS');

export interface IIntegrationRegistry {
  register(registration: ConnectorRegistration): void;
  unregister(connectorId: string): boolean;
  get(connectorId: string): ConnectorRegistration | undefined;
  list(): readonly ConnectorRegistration[];
  listDescriptors(): readonly ConnectorDescriptor[];
  setAvailable(connectorId: string, available: boolean): void;
}

export interface IIntegrationResolver {
  resolve(
    connectorId: string,
    operation: string,
  ): {
    readonly available: boolean;
    readonly registration?: ConnectorRegistration;
    readonly reason: string;
  };
}

export interface IConnectionLifecycleManager {
  authenticate(
    connectorId: string,
    mode?: IntegrationAuthMode,
    secretRef?: string,
  ): ConnectionSession;
  connect(connectorId: string): ConnectionSession;
  refresh(connectorId: string): ConnectionSession;
  disconnect(connectorId: string): ConnectionSession;
  getSession(connectorId: string): ConnectionSession | undefined;
  listSessions(): readonly ConnectionSession[];
  recover(connectorId: string): ConnectionSession;
}

export interface IIntegrationController {
  execute(dto: IntegrationRequestDto): Promise<IntegrationResult>;
}

/** Sole public Integration Service contract. */
export interface IIntegrationService {
  execute(request: IntegrationRequestDto): Promise<IntegrationResult>;
}

export type { IConnectorAdapter };
