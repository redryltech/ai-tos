import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IPerceptionProcessor } from '../contracts/perception.contracts';
import type {
  BasicEmotion,
  NormalizedPerceptionInput,
  PerceptionObservations,
  PerceptionPriority,
} from '../models/world-understanding.models';

/**
 * Perception Processor — observe, extract, normalize, detect.
 * Intent / entities / language / emotion / priority / type / metadata only.
 * No business logic beyond observation.
 */
@Injectable()
export class PerceptionProcessor implements IPerceptionProcessor {
  constructor(private readonly config: ConfigService) {}

  process(input: NormalizedPerceptionInput): PerceptionObservations {
    const text = input.content.trim();
    const language = this.detectLanguage(input);
    const intent = this.detectIntent(text, input.inputType);
    const entities = this.extractEntities(text);
    const emotion = this.detectEmotion(text);
    const priority = this.detectPriority(text, input.inputType);

    return Object.freeze({
      intent,
      entities: Object.freeze([...entities]),
      language,
      emotion,
      priority,
      inputType: input.inputType,
      metadata: Object.freeze({
        ...input.rawMetadata,
        contentLength: text.length,
        hasUri: Boolean(input.uri),
        hasBinaryRef: Boolean(input.contentBinaryRef),
        mimeType: input.mimeType ?? null,
      }),
    });
  }

  private detectLanguage(input: NormalizedPerceptionInput): string {
    if (input.languageHint && input.languageHint.trim().length >= 2) {
      return input.languageHint.trim().toLowerCase().slice(0, 16);
    }
    return this.config.perception.defaultLanguage.toLowerCase();
  }

  private detectIntent(text: string, inputType: string): string {
    const lower = text.toLowerCase();
    if (!text) return `observe_${inputType}`;
    if (/\b(buy|sell|trade|order)\b/.test(lower)) return 'trading_signal';
    if (/\b(analyze|analysis|report|summarize)\b/.test(lower)) return 'analysis_request';
    if (/\b(help|how|what|why|explain)\b/.test(lower)) return 'information_request';
    if (/\b(create|add|update|delete|remove)\b/.test(lower)) return 'mutation_request';
    if (inputType === 'event') return 'event_observation';
    if (inputType === 'api_request') return 'api_observation';
    return 'general_observation';
  }

  private extractEntities(text: string): string[] {
    if (!text) return [];
    const entities = new Set<string>();
    const tickerMatches = text.match(/\b[A-Z]{1,5}\b/g) ?? [];
    for (const t of tickerMatches.slice(0, 20)) {
      if (t.length >= 2) entities.add(t);
    }
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [];
    for (const e of emailMatches.slice(0, 10)) entities.add(e.toLowerCase());
    const urlMatches = text.match(/https?:\/\/[^\s]+/gi) ?? [];
    for (const u of urlMatches.slice(0, 10)) entities.add(u);
    return [...entities];
  }

  private detectEmotion(text: string): BasicEmotion {
    if (!text) return 'unknown';
    const lower = text.toLowerCase();
    if (/\b(urgent|asap|immediately|critical|emergency)\b/.test(lower)) return 'urgent';
    if (/\b(angry|frustrated|bad|terrible|hate|fail)\b/.test(lower)) return 'negative';
    if (/\b(great|good|thanks|love|excellent|happy)\b/.test(lower)) return 'positive';
    if (/\b(maybe|unsure|confused|unknown|\?{2,})\b/.test(lower)) return 'uncertain';
    return 'neutral';
  }

  private detectPriority(text: string, inputType: string): PerceptionPriority {
    const lower = text.toLowerCase();
    if (/\b(critical|emergency|sev-?0|p0)\b/.test(lower)) return 'critical';
    if (/\b(urgent|asap|high priority|p1)\b/.test(lower)) return 'high';
    if (/\b(low priority|whenever|p3)\b/.test(lower)) return 'low';
    if (inputType === 'event') return 'normal';
    return 'normal';
  }
}
