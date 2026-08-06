import type {
  ConnectorDescriptor,
  IntegrationRequest,
  IntegrationResult,
} from '../models/integration.models';

/**
 * Connector Adapter — hides provider-specific APIs.
 * Stub implementations only in this phase (no real vendor SDKs).
 */
export interface IConnectorAdapter {
  readonly adapterId: string;
  readonly connectorId: string;
  supports(connectorId: string): boolean;
  execute(request: IntegrationRequest): Promise<IntegrationResult>;
  descriptor(): ConnectorDescriptor;
}
