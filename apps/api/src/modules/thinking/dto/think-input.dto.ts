import type { WorldUnderstanding } from '../../perception/models/world-understanding.models';

/**
 * Public think() input — WorldUnderstanding from Perception.
 * Optional providedKnowledge is synthesized locally (never retrieved).
 */
export interface ThinkInputDto {
  readonly world: WorldUnderstanding;
  /** Caller-supplied facts only — never fetched from memory/AI. */
  readonly providedKnowledge?: ReadonlyArray<{
    readonly key: string;
    readonly value: string;
    readonly confidence?: number;
  }>;
  readonly conversationContext?: ReadonlyArray<string>;
  readonly systemContext?: ReadonlyArray<string>;
}
