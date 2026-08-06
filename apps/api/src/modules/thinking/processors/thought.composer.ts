import { Injectable } from '@nestjs/common';
import type { IThoughtComposer } from '../contracts/thinking.contracts';
import type {
  EvaluatedThought,
  KnowledgeContext,
  ThinkingContext,
  Thought,
} from '../models/thought.models';

/**
 * Thought Composer — merge strongest evaluated reasoning into canonical Thought.
 */
@Injectable()
export class ThoughtComposer implements IThoughtComposer {
  compose(
    thinkingContext: ThinkingContext,
    knowledge: KnowledgeContext,
    evaluated: EvaluatedThought,
  ): Thought {
    const ranked = evaluated.rankedCandidateIds;
    const rankedSet = new Set(ranked);
    const candidateSolutions = Object.freeze(
      [...evaluated.reasoning.candidateSolutions]
        .filter((c) => rankedSet.has(c.id))
        .sort((a, b) => ranked.indexOf(a.id) - ranked.indexOf(b.id))
        .map((c) =>
          Object.freeze({
            ...c,
            relatedStepIds: Object.freeze([...c.relatedStepIds]),
          }),
        ),
    );

    const constraints = Object.freeze([
      ...thinkingContext.constraintIds.map((id) => `constraint_ref:${id}`),
      ...evaluated.missingInformation.map((m) => `missing_info:${m}`),
    ]);

    const thought: Thought = Object.freeze({
      requestId: thinkingContext.requestId,
      userId: thinkingContext.userId,
      organizationId: thinkingContext.organizationId,
      goal: thinkingContext.goal,
      thinkingContext,
      knowledgeContext: knowledge,
      reasoning: Object.freeze({
        steps: Object.freeze(
          evaluated.reasoning.steps.map((s) =>
            Object.freeze({ ...s, support: Object.freeze([...s.support]) }),
          ),
        ),
        hypotheses: Object.freeze([...evaluated.reasoning.hypotheses]),
        alternatives: Object.freeze([...evaluated.reasoning.alternatives]),
        candidateSolutions,
        assumptions: Object.freeze([...evaluated.reasoning.assumptions]),
      }),
      candidateSolutions,
      assumptions: Object.freeze([...evaluated.reasoning.assumptions]),
      constraints,
      risks: Object.freeze(evaluated.risks.map((r) => Object.freeze({ ...r }))),
      confidence: evaluated.scores.confidence,
      recommendation: evaluated.recommendation,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        thoughtAt: new Date().toISOString(),
        rankedCandidateIds: Object.freeze([...ranked]),
        evaluation: evaluated.scores,
        missingInformation: Object.freeze([...evaluated.missingInformation]),
        weakAssumptions: Object.freeze([...evaluated.weakAssumptions]),
        extras: Object.freeze({
          intent: thinkingContext.intent,
          inputType: thinkingContext.inputType,
          coverageScore: knowledge.coverageScore,
          stepCount: evaluated.reasoning.steps.length,
          sessionId: thinkingContext.sessionId ?? null,
        }),
      }),
    });

    this.assertShape(thought);
    return thought;
  }

  private assertShape(thought: Thought): void {
    if (!thought.requestId) throw new Error('Thought.requestId is required');
    if (!thought.goal) throw new Error('Thought.goal is required');
    if (!thought.thinkingContext) throw new Error('Thought.thinkingContext is required');
    if (!thought.knowledgeContext) throw new Error('Thought.knowledgeContext is required');
    if (!thought.reasoning) throw new Error('Thought.reasoning is required');
    if (!Array.isArray(thought.candidateSolutions)) {
      throw new Error('Thought.candidateSolutions must be an array');
    }
    if (!Array.isArray(thought.assumptions)) {
      throw new Error('Thought.assumptions must be an array');
    }
    if (!Array.isArray(thought.constraints)) {
      throw new Error('Thought.constraints must be an array');
    }
    if (!Array.isArray(thought.risks)) {
      throw new Error('Thought.risks must be an array');
    }
    if (typeof thought.confidence !== 'number') {
      throw new Error('Thought.confidence is required');
    }
    if (typeof thought.recommendation !== 'string' || thought.recommendation.length === 0) {
      throw new Error('Thought.recommendation is required');
    }
    if (!thought.metadata || thought.metadata.schemaVersion !== '1.0.0') {
      throw new Error('Thought.metadata.schemaVersion must be 1.0.0');
    }
  }
}
