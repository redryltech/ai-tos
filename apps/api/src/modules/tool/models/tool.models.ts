/** Tool Service domain models (Layer 4.5). Deterministic tools only. */

export type ToolId = string;

export type ToolExecutionMode = 'sync' | 'async' | 'stream';

export type ToolStatus = 'completed' | 'failed' | 'timeout' | 'cancelled';

export type ToolLifecycle = 'registered' | 'active' | 'deprecated' | 'disabled';

export interface ToolConstraints {
  readonly timeoutMs?: number;
  readonly allowStream?: boolean;
  readonly maxOutputBytes?: number;
}

export interface ToolOptions {
  readonly mode?: ToolExecutionMode;
  readonly stream?: boolean;
  readonly cancelToken?: string;
  readonly extras?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ToolRequest {
  readonly requestId: string;
  readonly toolId: ToolId;
  readonly input: Readonly<Record<string, unknown>>;
  readonly options?: ToolOptions;
  readonly constraints?: ToolConstraints;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
}

export interface ToolResult {
  readonly requestId: string;
  readonly toolId: ToolId;
  readonly status: ToolStatus;
  readonly output: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly duration: number;
  readonly traceId: string;
}

export interface ToolDescriptor {
  readonly toolId: ToolId;
  readonly name: string;
  readonly version: string;
  readonly lifecycle: ToolLifecycle;
  readonly inputTypes: readonly string[];
  readonly outputTypes: readonly string[];
  readonly executionMode: ToolExecutionMode;
  readonly timeoutMs: number;
  readonly capabilities: readonly string[];
  readonly streamingSupport: boolean;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ToolRegistration {
  readonly descriptor: ToolDescriptor;
  readonly adapterId: string;
  readonly available: boolean;
}

export const BUILTIN_TOOL_IDS = [
  'filesystem',
  'shell',
  'python_runtime',
  'javascript_runtime',
  'http_client',
  'sql_executor',
  'nosql_executor',
  'calculator',
  'json_processor',
  'csv_processor',
  'xml_processor',
  'compression',
  'encoding',
  'pdf_processor',
  'archive_processor',
  'image_processor',
  'browser_automation',
] as const;
