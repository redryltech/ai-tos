import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IMemoryEvaluator } from '../contracts/memory.contracts';
import type { RememberMemoryDto } from '../dto/memory.dto';
import type { MemoryEvaluation, MemoryKind } from '../models/memory.models';

/**
 * Memory Evaluator — decide store/discard and target kind.
 * Never reasons about world knowledge; pattern-based experience triage only.
 */
@Injectable()
export class MemoryEvaluator implements IMemoryEvaluator {
  constructor(private readonly config: ConfigService) {}

  evaluate(input: RememberMemoryDto): MemoryEvaluation {
    const content = (input.content ?? '').trim();
    if (!content) {
      return Object.freeze({
        store: false,
        kind: 'session',
        importance: 'low',
        reason: 'empty_content',
        ttlSeconds: null,
        discardReason: 'Empty experience content',
      });
    }

    if (this.isGreetingOrNoise(content)) {
      return Object.freeze({
        store: false,
        kind: 'session',
        importance: 'low',
        reason: 'noise',
        ttlSeconds: null,
        discardReason: 'Greeting or low-signal utterance discarded',
      });
    }

    const kind = this.resolveKind(content, input.kindHint);
    const importance = input.importanceHint ?? this.resolveImportance(content, kind);
    const ttlSeconds = this.resolveTtl(kind);

    return Object.freeze({
      store: true,
      kind,
      importance,
      reason: `classified_as_${kind}`,
      ttlSeconds,
    });
  }

  private isGreetingOrNoise(content: string): boolean {
    const lower = content.toLowerCase().replace(/[!?.]+$/g, '').trim();
    const greetings = new Set([
      'hi',
      'hello',
      'hey',
      'yo',
      'thanks',
      'thank you',
      'ok',
      'okay',
      'bye',
      'goodbye',
    ]);
    if (greetings.has(lower)) return true;
    if (lower.length <= 3) return true;
    return false;
  }

  private resolveKind(content: string, hint?: MemoryKind): MemoryKind {
    if (hint) return hint;
    const lower = content.toLowerCase();
    if (
      /\b(always|prefer|preference|usually|never|my default|organization prefers)\b/.test(
        lower,
      )
    ) {
      return 'long_term';
    }
    if (
      /\b(failed|failure|error|lesson|completed|success|outcome|execution|incident|event)\b/.test(
        lower,
      )
    ) {
      return 'episodic';
    }
    return 'session';
  }

  private resolveImportance(
    content: string,
    kind: MemoryKind,
  ): MemoryEvaluation['importance'] {
    const lower = content.toLowerCase();
    if (/\b(critical|sev-?0|p0|emergency)\b/.test(lower)) return 'critical';
    if (kind === 'long_term' || kind === 'episodic') return 'high';
    if (/\b(important|prefer|always)\b/.test(lower)) return 'high';
    return 'normal';
  }

  private resolveTtl(kind: MemoryKind): number | null {
    const cfg = this.config.memory;
    if (kind === 'session') return cfg.sessionTtlSeconds;
    if (kind === 'long_term') {
      return cfg.longTermTtlSeconds > 0 ? cfg.longTermTtlSeconds : null;
    }
    return cfg.episodicTtlSeconds > 0 ? cfg.episodicTtlSeconds : null;
  }
}
