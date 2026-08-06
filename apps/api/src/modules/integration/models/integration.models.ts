/** Integration Service domain models (Layer 4.6). External connectors only. */

export type ConnectorId = string;

export type IntegrationAuthMode =
  | 'api_key'
  | 'oauth'
  | 'oauth2'
  | 'jwt'
  | 'managed_identity'
  | 'certificate'
  | 'basic';

export type IntegrationStatus =
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'auth_failed';

export type ConnectorLifecycle =
  | 'registered'
  | 'active'
  | 'deprecated'
  | 'disabled';

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticating'
  | 'error';

export interface IntegrationOptions {
  readonly timeoutMs?: number;
  readonly authMode?: IntegrationAuthMode;
  readonly extras?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface IntegrationRequest {
  readonly requestId: string;
  readonly connectorId: ConnectorId;
  readonly operation: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly options?: IntegrationOptions;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
}

export interface IntegrationResult {
  readonly requestId: string;
  readonly connectorId: ConnectorId;
  readonly status: IntegrationStatus;
  readonly output: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly duration: number;
  readonly traceId: string;
}

export interface ConnectorDescriptor {
  readonly connectorId: ConnectorId;
  readonly name: string;
  readonly version: string;
  readonly lifecycle: ConnectorLifecycle;
  readonly protocols: readonly string[];
  readonly authTypes: readonly IntegrationAuthMode[];
  readonly capabilities: readonly string[];
  readonly timeoutMs: number;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ConnectorRegistration {
  readonly descriptor: ConnectorDescriptor;
  readonly adapterId: string;
  readonly available: boolean;
}

export interface ConnectionSession {
  readonly connectorId: ConnectorId;
  readonly sessionId: string;
  readonly state: ConnectionState;
  readonly authMode: IntegrationAuthMode;
  readonly poolSlot: number;
  readonly connectedAt?: number;
  readonly lastError?: string;
  readonly credentialRef?: string;
}

export const BUILTIN_CONNECTOR_IDS = [
  'github',
  'gitlab',
  'slack',
  'discord',
  'microsoft_teams',
  'salesforce',
  'sap',
  'oracle_erp',
  'google_drive',
  'dropbox',
  'sharepoint',
  'aws',
  'azure',
  'google_cloud',
  'postgresql',
  'mongodb',
  'redis',
  'kafka',
  'rabbitmq',
  'rest_api',
  'graphql_api',
  'soap_service',
  'mcp_server',
] as const;
