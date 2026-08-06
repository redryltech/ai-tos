/** Thinking Engine domain models (Layer 3.2). Immutable typed contracts. */

export type ReasoningKind =
  | 'logical'
  | 'comparative'
  | 'causal'
  | 'hypothesis'
  | 'alternative'
  | 'multi_step';

export type ThoughtRiskSeverity = 'info' | 'warning' | 'high';

export interface ThinkingContext {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly goal: string;
  readonly intent: string;
  readonly language: string;
  readonly priority: string;
  readonly emotion: string;
  readonly inputType: string;
  readonly objectIds: readonly string[];
  readonly relationshipIds: readonly string[];
  readonly constraintIds: readonly string[];
  readonly unknownFields: readonly string[];
  readonly safetyCategories: readonly string[];
  readonly perceptionConfidence: number;
  readonly environment: Readonly<Record<string, string | number | boolean | null>>;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly builtAt: string;
}

export interface KnowledgeFact {
  readonly id: string;
  readonly source: 'world' | 'conversation' | 'system' | 'provided';
  readonly key: string;
  readonly value: string;
  readonly confidence: number;
}

export interface KnowledgeContext {
  readonly facts: readonly KnowledgeFact[];
  readonly conversationNotes: readonly string[];
  readonly systemNotes: readonly string[];
  readonly coverageScore: number;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ReasoningStep {
  readonly id: string;
  readonly kind: ReasoningKind;
  readonly premise: string;
  readonly inference: string;
  readonly support: readonly string[];
}

export interface CandidateSolution {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly rationale: string;
  readonly score: number;
  readonly relatedStepIds: readonly string[];
}

export interface ReasoningBundle {
  readonly steps: readonly ReasoningStep[];
  readonly hypotheses: readonly string[];
  readonly alternatives: readonly string[];
  readonly candidateSolutions: readonly CandidateSolution[];
  readonly assumptions: readonly string[];
}

export interface ThoughtRisk {
  readonly id: string;
  readonly category: string;
  readonly description: string;
  readonly severity: ThoughtRiskSeverity;
}

export interface EvaluationScores {
  readonly quality: number;
  readonly confidence: number;
  readonly risk: number;
  readonly completeness: number;
  readonly consistency: number;
}

export interface EvaluatedThought {
  readonly reasoning: ReasoningBundle;
  readonly scores: EvaluationScores;
  readonly missingInformation: readonly string[];
  readonly weakAssumptions: readonly string[];
  readonly risks: readonly ThoughtRisk[];
  readonly rankedCandidateIds: readonly string[];
  readonly recommendation: string;
}

/** Canonical Thinking Engine output — identical structure for every request. */
export interface Thought {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly goal: string;
  readonly thinkingContext: ThinkingContext;
  readonly knowledgeContext: KnowledgeContext;
  readonly reasoning: ReasoningBundle;
  readonly candidateSolutions: readonly CandidateSolution[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly risks: readonly ThoughtRisk[];
  readonly confidence: number;
  readonly recommendation: string;
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    thoughtAt: string;
    rankedCandidateIds: readonly string[];
    evaluation: EvaluationScores;
    missingInformation: readonly string[];
    weakAssumptions: readonly string[];
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
}
