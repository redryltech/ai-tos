import type { WorldUnderstanding } from '../../perception/models/world-understanding.models';
import type { ThinkInputDto } from '../dto/think-input.dto';
import type {
  EvaluatedThought,
  KnowledgeContext,
  ReasoningBundle,
  ThinkingContext,
  Thought,
} from '../models/thought.models';

export const CONTEXT_BUILDER = Symbol('CONTEXT_BUILDER');
export const KNOWLEDGE_SYNTHESIZER = Symbol('KNOWLEDGE_SYNTHESIZER');
export const REASONING_CORE = Symbol('REASONING_CORE');
export const CRITICAL_EVALUATOR = Symbol('CRITICAL_EVALUATOR');
export const THOUGHT_COMPOSER = Symbol('THOUGHT_COMPOSER');
export const THINKING_SERVICE = Symbol('THINKING_SERVICE');

export interface IContextBuilder {
  build(world: WorldUnderstanding): ThinkingContext;
}

export interface IKnowledgeSynthesizer {
  synthesize(
    thinkingContext: ThinkingContext,
    input: ThinkInputDto,
  ): KnowledgeContext;
}

export interface IReasoningCore {
  reason(
    thinkingContext: ThinkingContext,
    knowledge: KnowledgeContext,
  ): ReasoningBundle;
}

export interface ICriticalEvaluator {
  evaluate(
    thinkingContext: ThinkingContext,
    knowledge: KnowledgeContext,
    reasoning: ReasoningBundle,
  ): EvaluatedThought;
}

export interface IThoughtComposer {
  compose(
    thinkingContext: ThinkingContext,
    knowledge: KnowledgeContext,
    evaluated: EvaluatedThought,
  ): Thought;
}

/** Sole public Thinking Engine contract: think(worldUnderstanding) → Thought. */
export interface IThinkingService {
  think(input: WorldUnderstanding | ThinkInputDto): Promise<Thought>;
}
