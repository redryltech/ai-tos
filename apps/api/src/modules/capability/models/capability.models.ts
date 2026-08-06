/** Capability Service domain models (Layer 4.3). Capabilities — not models. */

/** Builtin and dynamically registered capability names (open for registration). */
export type CapabilityName = string;

export const BUILTIN_CAPABILITY_NAMES = [
  'reasoning',
  'text_generation',
  'translation',
  'vision',
  'ocr',
  'speech_to_text',
  'text_to_speech',
  'embeddings',
  'classification',
  'extraction',
  'moderation',
  'image_generation',
  'image_understanding',
  'audio_understanding',
  'video_understanding',
  'code_generation',
  'function_calling',
] as const;

export type CapabilityTier = 'local' | 'cloud' | 'enterprise';

export type CapabilityStatus =
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export type CapabilityLifecycle = 'registered' | 'active' | 'deprecated' | 'disabled';

export interface CapabilityConstraints {
  readonly timeoutMs?: number;
  readonly requireStreaming?: boolean;
  readonly preferredTier?: CapabilityTier;
  readonly maxLatencyMs?: number;
  readonly allowFallback?: boolean;
}

export interface CapabilityOptions {
  readonly pipeline?: readonly CapabilityName[];
  readonly parallel?: boolean;
  readonly cancelToken?: string;
  readonly extras?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface CapabilityRequest {
  readonly requestId: string;
  readonly capability: CapabilityName;
  readonly input: Readonly<Record<string, unknown>>;
  readonly constraints?: CapabilityConstraints;
  readonly options?: CapabilityOptions;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId: string;
}

export interface CapabilityResult {
  readonly requestId: string;
  readonly capability: CapabilityName;
  readonly status: CapabilityStatus;
  readonly output: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly duration: number;
  readonly traceId: string;
}

export interface CapabilityDescriptor {
  readonly name: CapabilityName;
  readonly version: string;
  readonly lifecycle: CapabilityLifecycle;
  readonly supportedInputs: readonly string[];
  readonly supportedOutputs: readonly string[];
  readonly latencyClass: 'low' | 'medium' | 'high';
  readonly streamingSupport: boolean;
  readonly providerRequirements: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface CapabilityImplementation {
  readonly id: string;
  readonly capability: CapabilityName;
  readonly version: string;
  readonly tier: CapabilityTier;
  readonly priority: number;
  readonly available: boolean;
  readonly descriptor: CapabilityDescriptor;
  readonly providerId: string;
}
