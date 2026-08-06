import type {
  ModelAuthMode,
  ModelRequest,
  ModelResponse,
  ProviderDescriptor,
  ProviderCapabilitiesMeta,
  ModelProviderKind,
} from '../models/model.models';
import type { IProviderAdapter } from './provider.adapter';

const ALL_AUTH_MODES: readonly ModelAuthMode[] = Object.freeze([
  'api_key',
  'oauth',
  'jwt',
  'managed_identity',
  'certificate',
]);
function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function extractText(input: Readonly<Record<string, unknown>>): string {
  if (typeof input.text === 'string') return input.text;
  if (typeof input.prompt === 'string') return input.prompt;
  if (typeof input.content === 'string') return input.content;
  return JSON.stringify(input);
}

/**
 * Shared stub adapter factory — provider-shaped responses, no vendor SDKs.
 */
export function createStubAdapter(opts: {
  adapterId: string;
  providerId: string;
  kind: ModelProviderKind;
  displayName: string;
  models: readonly string[];
  capabilities?: Partial<ProviderCapabilitiesMeta>;
}): IProviderAdapter {
  const capabilities: ProviderCapabilitiesMeta = Object.freeze({
    chat: true,
    completion: true,
    embedding: opts.capabilities?.embedding ?? opts.kind === 'local',
    vision: opts.capabilities?.vision ?? false,
    streaming: opts.capabilities?.streaming ?? true,
    batch: opts.capabilities?.batch ?? true,
  });

  const descriptor: ProviderDescriptor = Object.freeze({
    providerId: opts.providerId,
    kind: opts.kind,
    displayName: opts.displayName,
    version: '1.0.0',
    lifecycle: 'active',
    models: Object.freeze([...opts.models]),
    capabilities,
    authModes: ALL_AUTH_MODES,
    metadata: Object.freeze({ stub: true, sdk: false }),
  });

  return {
    adapterId: opts.adapterId,
    providerId: opts.providerId,
    supports(modelId: string): boolean {
      return opts.models.includes(modelId) || modelId.startsWith(`${opts.kind}:`);
    },
    descriptor(): ProviderDescriptor {
      return descriptor;
    },
    async infer(request: ModelRequest): Promise<ModelResponse> {
      const started = Date.now();
      const text = extractText(request.input);
      const mode = request.options?.mode ?? (request.options?.stream ? 'stream' : 'sync');
      const promptTokens = estimateTokens(text);
      const completionText = `[${opts.kind}] ${text}`;
      const completionTokens = estimateTokens(completionText);

      return Object.freeze({
        requestId: request.requestId,
        providerId: opts.providerId,
        modelId: request.modelId,
        status: 'completed',
        output: Object.freeze({
          text: completionText,
          mode,
          providerKind: opts.kind,
          streamed: mode === 'stream',
          batchSize: mode === 'batch' ? 1 : undefined,
        }),
        usage: Object.freeze({
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        }),
        metadata: Object.freeze({
          adapterId: opts.adapterId,
          stub: true,
        }),
        duration: Date.now() - started,
        traceId: request.traceId,
      });
    },
  };
}

export function createBuiltinAdapters(): IProviderAdapter[] {
  return [
    createStubAdapter({
      adapterId: 'local-adapter',
      providerId: 'local',
      kind: 'local',
      displayName: 'Local Models',
      models: ['local-default', 'local-embed'],
      capabilities: { embedding: true, vision: true },
    }),
    createStubAdapter({
      adapterId: 'openai-adapter',
      providerId: 'openai',
      kind: 'openai',
      displayName: 'OpenAI',
      models: ['gpt-stub', 'text-embedding-stub'],
      capabilities: { embedding: true, vision: true },
    }),
    createStubAdapter({
      adapterId: 'claude-adapter',
      providerId: 'anthropic',
      kind: 'anthropic',
      displayName: 'Anthropic Claude',
      models: ['claude-stub'],
    }),
    createStubAdapter({
      adapterId: 'gemini-adapter',
      providerId: 'gemini',
      kind: 'gemini',
      displayName: 'Google Gemini',
      models: ['gemini-stub'],
      capabilities: { vision: true },
    }),
    createStubAdapter({
      adapterId: 'azure-adapter',
      providerId: 'azure_openai',
      kind: 'azure_openai',
      displayName: 'Azure OpenAI',
      models: ['azure-gpt-stub'],
    }),
    createStubAdapter({
      adapterId: 'bedrock-adapter',
      providerId: 'bedrock',
      kind: 'bedrock',
      displayName: 'AWS Bedrock',
      models: ['bedrock-stub'],
    }),
    createStubAdapter({
      adapterId: 'ollama-adapter',
      providerId: 'ollama',
      kind: 'ollama',
      displayName: 'Ollama',
      models: ['ollama-stub'],
    }),
    createStubAdapter({
      adapterId: 'vllm-adapter',
      providerId: 'vllm',
      kind: 'vllm',
      displayName: 'vLLM',
      models: ['vllm-stub'],
    }),
  ];
}
