/** Model Service domain models (Layer 4.4). Inference only — never capabilities or business logic. */

/** Provider kind — builtins + dynamically registered future providers. */
export type ModelProviderKind = string;

export const BUILTIN_PROVIDER_KINDS = [
  'openai',
  'anthropic',
  'gemini',
  'azure_openai',
  'bedrock',
  'ollama',
  'vllm',
  'local',
] as const;
export type ModelAuthMode =
  | 'api_key'
  | 'oauth'
  | 'jwt'
  | 'managed_identity'
  | 'certificate';

export type ModelInferenceMode = 'sync' | 'async' | 'stream' | 'batch';

export type ModelResponseStatus =
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'cancelled';

export type ProviderLifecycle =
  | 'registered'
  | 'active'
  | 'deprecated'
  | 'disabled';

export type ProviderHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'unhealthy'
  | 'unknown';

export interface ModelOptions {
  readonly mode?: ModelInferenceMode;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly timeoutMs?: number;
  readonly stream?: boolean;
  readonly extras?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ModelRequest {
  readonly requestId: string;
  readonly providerId: string;
  readonly modelId: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly options?: ModelOptions;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
}

export interface ModelUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface ModelResponse {
  readonly requestId: string;
  readonly providerId: string;
  readonly modelId: string;
  readonly status: ModelResponseStatus;
  readonly output: Readonly<Record<string, unknown>>;
  readonly usage: ModelUsage;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly duration: number;
  readonly traceId: string;
}

export interface ProviderCapabilitiesMeta {
  readonly chat: boolean;
  readonly completion: boolean;
  readonly embedding: boolean;
  readonly vision: boolean;
  readonly streaming: boolean;
  readonly batch: boolean;
}

export interface ProviderDescriptor {
  readonly providerId: string;
  readonly kind: ModelProviderKind;
  readonly displayName: string;
  readonly version: string;
  readonly lifecycle: ProviderLifecycle;
  readonly models: readonly string[];
  readonly capabilities: ProviderCapabilitiesMeta;
  readonly authModes: readonly ModelAuthMode[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ProviderRegistration {
  readonly descriptor: ProviderDescriptor;
  readonly adapterId: string;
  readonly available: boolean;
}

export interface ProviderCredential {
  readonly providerId: string;
  readonly mode: ModelAuthMode;
  readonly secretRef: string;
  readonly expiresAt?: number;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ProviderHealthSnapshot {
  readonly providerId: string;
  readonly status: ProviderHealthStatus;
  readonly latencyMs: number;
  readonly availability: number;
  readonly failureCount: number;
  readonly lastCheckedAt: number;
  readonly lastError?: string;
}

export interface UsageRecord {
  readonly requestId: string;
  readonly providerId: string;
  readonly modelId: string;
  readonly usage: ModelUsage;
  readonly duration: number;
  readonly status: ModelResponseStatus;
  readonly recordedAt: number;
}
