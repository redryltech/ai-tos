import type {
  ConnectorDescriptor,
  IntegrationAuthMode,
  IntegrationRequest,
  IntegrationResult,
} from '../models/integration.models';
import { BUILTIN_CONNECTOR_IDS } from '../models/integration.models';
import type { IConnectorAdapter } from './connector.adapter';

const ALL_AUTH: readonly IntegrationAuthMode[] = Object.freeze([
  'api_key',
  'oauth',
  'oauth2',
  'jwt',
  'managed_identity',
  'certificate',
  'basic',
]);

function protocolFor(id: string): readonly string[] {
  if (id === 'graphql_api') return Object.freeze(['graphql', 'https']);
  if (id === 'soap_service') return Object.freeze(['soap', 'https']);
  if (id === 'mcp_server') return Object.freeze(['mcp', 'stdio', 'http']);
  if (id === 'kafka') return Object.freeze(['kafka']);
  if (id === 'rabbitmq') return Object.freeze(['amqp']);
  if (id === 'postgresql' || id === 'mongodb' || id === 'redis') {
    return Object.freeze(['tcp']);
  }
  return Object.freeze(['https', 'rest']);
}

/** Stub connector factory — no vendor SDKs, no real network I/O. */
export function createStubConnectorAdapter(opts: {
  connectorId: string;
  name: string;
  capabilities?: readonly string[];
  protocols?: readonly string[];
  timeoutMs?: number;
}): IConnectorAdapter {
  const descriptor: ConnectorDescriptor = Object.freeze({
    connectorId: opts.connectorId,
    name: opts.name,
    version: '1.0.0',
    lifecycle: 'active',
    protocols: Object.freeze([...(opts.protocols ?? protocolFor(opts.connectorId))]),
    authTypes: ALL_AUTH,
    capabilities: Object.freeze([
      ...(opts.capabilities ?? ['read', 'write', 'list']),
    ]),
    timeoutMs: opts.timeoutMs ?? 30_000,
    metadata: Object.freeze({ stub: true, sdk: false }),
  });

  return {
    adapterId: `${opts.connectorId}-adapter`,
    connectorId: opts.connectorId,
    supports(connectorId: string): boolean {
      return connectorId === opts.connectorId;
    },
    descriptor(): ConnectorDescriptor {
      return descriptor;
    },
    async execute(request: IntegrationRequest): Promise<IntegrationResult> {
      const started = Date.now();
      return Object.freeze({
        requestId: request.requestId,
        connectorId: opts.connectorId,
        status: 'completed',
        output: Object.freeze({
          operation: request.operation,
          accepted: true,
          stub: true,
          echo: request.input,
          provider: opts.connectorId,
        }),
        metadata: Object.freeze({
          adapterId: `${opts.connectorId}-adapter`,
          stub: true,
        }),
        duration: Date.now() - started,
        traceId: request.traceId,
      });
    },
  };
}

const NAMES: Record<(typeof BUILTIN_CONNECTOR_IDS)[number], string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  slack: 'Slack',
  discord: 'Discord',
  microsoft_teams: 'Microsoft Teams',
  salesforce: 'Salesforce',
  sap: 'SAP',
  oracle_erp: 'Oracle ERP',
  google_drive: 'Google Drive',
  dropbox: 'Dropbox',
  sharepoint: 'SharePoint',
  aws: 'AWS',
  azure: 'Azure',
  google_cloud: 'Google Cloud',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  kafka: 'Kafka',
  rabbitmq: 'RabbitMQ',
  rest_api: 'REST APIs',
  graphql_api: 'GraphQL APIs',
  soap_service: 'SOAP Services',
  mcp_server: 'MCP Servers',
};

export function createBuiltinConnectorAdapters(): IConnectorAdapter[] {
  return BUILTIN_CONNECTOR_IDS.map((connectorId) =>
    createStubConnectorAdapter({
      connectorId,
      name: NAMES[connectorId],
    }),
  );
}
