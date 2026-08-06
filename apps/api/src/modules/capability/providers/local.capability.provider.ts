import type {
  CapabilityImplementation,
  CapabilityRequest,
  CapabilityResult,
} from '../models/capability.models';
import type { ICapabilityProvider } from './capability.provider';

/**
 * Local capability provider — deterministic stubs.
 * Provider-agnostic; does not call external AI vendors.
 */
export class LocalCapabilityProvider implements ICapabilityProvider {
  readonly providerId = 'local-capability-provider';
  readonly tier = 'local' as const;

  supports(implementationId: string): boolean {
    return implementationId.startsWith('local:');
  }

  async execute(
    implementation: CapabilityImplementation,
    request: CapabilityRequest,
  ): Promise<CapabilityResult> {
    const started = Date.now();
    const input = request.input;
    const text =
      typeof input.text === 'string'
        ? input.text
        : typeof input.content === 'string'
          ? input.content
          : JSON.stringify(input);

    const output = this.buildOutput(implementation.capability, text, input);

    return Object.freeze({
      requestId: request.requestId,
      capability: implementation.capability,
      status: 'completed',
      output: Object.freeze(output),
      metadata: Object.freeze({
        providerId: this.providerId,
        implementationId: implementation.id,
        tier: implementation.tier,
        version: implementation.version,
      }),
      duration: Date.now() - started,
      traceId: request.traceId,
    });
  }

  private buildOutput(
    capability: string,
    text: string,
    input: Readonly<Record<string, unknown>>,
  ): Record<string, unknown> {
    switch (capability) {
      case 'translation':
        return {
          translatedText: text,
          targetLanguage: input.targetLanguage ?? 'en',
        };
      case 'embeddings':
        return {
          embeddingRef: `local-emb:${hash(text)}`,
          dimensions: 8,
          values: embedStub(text),
        };
      case 'classification':
        return { label: text.length > 40 ? 'long' : 'short', confidence: 0.7 };
      case 'extraction':
        return { entities: extractTokens(text).slice(0, 10) };
      case 'moderation':
        return {
          flagged: /\b(password|secret|api[_-]?key)\b/i.test(text),
          categories: [],
        };
      case 'ocr':
      case 'vision':
      case 'image_understanding':
        return { text: text || 'image_descriptor', notes: 'local_stub' };
      case 'speech_to_text':
        return { transcript: text || 'audio_transcript_stub' };
      case 'text_to_speech':
        return { audioRef: `local-audio:${hash(text)}` };
      case 'image_generation':
        return { imageRef: `local-image:${hash(text)}` };
      case 'audio_understanding':
      case 'video_understanding':
        return { summary: text.slice(0, 160), notes: 'local_stub' };
      case 'code_generation':
        return { code: `// local stub\n${text.slice(0, 200)}` };
      case 'function_calling':
        return {
          functionName: input.functionName ?? 'noop',
          arguments: input.arguments ?? {},
        };
      case 'reasoning':
        return { insight: `observed:${text.slice(0, 160)}` };
      case 'text_generation':
      default:
        return { text: `capability:${capability}: ${text.slice(0, 240)}` };
    }
  }
}

function extractTokens(text: string): string[] {
  return text
    .split(/[^a-zA-Z0-9_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function hash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16);
}

function embedStub(text: string): number[] {
  const h = hash(text);
  return Array.from({ length: 8 }, (_, i) => ((parseInt(h, 16) >> i) & 1) * 0.1);
}
