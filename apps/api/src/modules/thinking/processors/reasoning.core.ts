import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import type { IReasoningCore } from '../contracts/thinking.contracts';
import type {
  CandidateSolution,
  KnowledgeContext,
  ReasoningBundle,
  ReasoningStep,
  ThinkingContext,
} from '../models/thought.models';

/**
 * Reasoning Core — modular logical / comparative / causal / hypothesis /
 * alternative / multi-step reasoning. Produces candidate thoughts only.
 * Never decides or plans execution.
 */
@Injectable()
export class ReasoningCore implements IReasoningCore {
  constructor(private readonly config: ConfigService) {}

  reason(
    thinkingContext: ThinkingContext,
    knowledge: KnowledgeContext,
  ): ReasoningBundle {
    const steps: ReasoningStep[] = [
      ...this.logical(thinkingContext, knowledge),
      ...this.comparative(thinkingContext, knowledge),
      ...this.causal(thinkingContext, knowledge),
      ...this.hypothesis(thinkingContext, knowledge),
      ...this.alternative(thinkingContext),
      ...this.multiStep(thinkingContext, knowledge),
    ];

    const hypotheses = Object.freeze(
      steps.filter((s) => s.kind === 'hypothesis').map((s) => s.inference),
    );
    const alternatives = Object.freeze(
      steps.filter((s) => s.kind === 'alternative').map((s) => s.inference),
    );
    const assumptions = Object.freeze(this.buildAssumptions(thinkingContext, knowledge));
    const candidateSolutions = Object.freeze(
      this.buildCandidates(thinkingContext, knowledge, steps),
    );

    return Object.freeze({
      steps: Object.freeze(steps),
      hypotheses,
      alternatives,
      candidateSolutions,
      assumptions,
    });
  }

  private logical(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
  ): ReasoningStep[] {
    return [
      Object.freeze({
        id: randomUUID(),
        kind: 'logical',
        premise: `goal=${ctx.goal}; intent=${ctx.intent}`,
        inference: `If intent is ${ctx.intent}, reasoning should address goal "${ctx.goal}" under priority ${ctx.priority}`,
        support: Object.freeze([
          `fact_count=${knowledge.facts.length}`,
          `coverage=${knowledge.coverageScore}`,
        ]),
      }),
    ];
  }

  private comparative(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
  ): ReasoningStep[] {
    const entityFacts = knowledge.facts.filter((f) => f.key === 'entity');
    if (entityFacts.length < 2) {
      return [
        Object.freeze({
          id: randomUUID(),
          kind: 'comparative',
          premise: 'fewer than two entities observed',
          inference: 'Comparative analysis limited; primary focus remains single-subject goal',
          support: Object.freeze([`entity_count=${entityFacts.length}`]),
        }),
      ];
    }
    const a = entityFacts[0]!.value;
    const b = entityFacts[1]!.value;
    return [
      Object.freeze({
        id: randomUUID(),
        kind: 'comparative',
        premise: `compare ${a} vs ${b}`,
        inference: `Relative consideration of ${a} and ${b} is relevant to ${ctx.intent}`,
        support: Object.freeze([a, b]),
      }),
    ];
  }

  private causal(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
  ): ReasoningStep[] {
    const unknowns = ctx.unknownFields;
    return [
      Object.freeze({
        id: randomUUID(),
        kind: 'causal',
        premise: `unknowns=${unknowns.join(',') || 'none'}; safety=${ctx.safetyCategories.join(',') || 'none'}`,
        inference:
          unknowns.length > 0
            ? `Missing fields (${unknowns.join(', ')}) may reduce conclusion strength for ${ctx.goal}`
            : `No major unknown fields; causal chain for ${ctx.goal} is comparatively intact`,
        support: Object.freeze([
          `perception_confidence=${ctx.perceptionConfidence}`,
          `coverage=${knowledge.coverageScore}`,
        ]),
      }),
    ];
  }

  private hypothesis(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
  ): ReasoningStep[] {
    return [
      Object.freeze({
        id: randomUUID(),
        kind: 'hypothesis',
        premise: `intent=${ctx.intent}`,
        inference: `Hypothesis: satisfying "${ctx.goal}" requires clarifying intent ${ctx.intent} with available knowledge coverage ${knowledge.coverageScore}`,
        support: Object.freeze([`language=${ctx.language}`, `emotion=${ctx.emotion}`]),
      }),
    ];
  }

  private alternative(ctx: ThinkingContext): ReasoningStep[] {
    return [
      Object.freeze({
        id: randomUUID(),
        kind: 'alternative',
        premise: `priority=${ctx.priority}`,
        inference: `Alternative: defer deep analysis and produce a shallow structured thought for ${ctx.goal}`,
        support: Object.freeze([`input_type=${ctx.inputType}`]),
      }),
      Object.freeze({
        id: randomUUID(),
        kind: 'alternative',
        premise: `priority=${ctx.priority}`,
        inference: `Alternative: emphasize risk and unknowns before proposing directions for ${ctx.goal}`,
        support: Object.freeze([`unknowns=${ctx.unknownFields.length}`]),
      }),
    ];
  }

  private multiStep(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
  ): ReasoningStep[] {
    return [
      Object.freeze({
        id: randomUUID(),
        kind: 'multi_step',
        premise: 'observe → relate → hypothesize → compare',
        inference: `Multi-step path: ground on ${ctx.objectIds.length} objects, synthesize ${knowledge.facts.length} facts, then rank candidate thoughts for ${ctx.goal}`,
        support: Object.freeze([
          `relationships=${ctx.relationshipIds.length}`,
          `constraints=${ctx.constraintIds.length}`,
        ]),
      }),
    ];
  }

  private buildAssumptions(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
  ): string[] {
    const assumptions = [
      `Perception intent "${ctx.intent}" is a faithful observation, not a decision`,
      `Knowledge coverage ${knowledge.coverageScore} reflects provided facts only`,
    ];
    if (!ctx.userId) assumptions.push('Actor identity may be anonymous');
    if (!ctx.organizationId) assumptions.push('Organization scope is unspecified');
    return assumptions;
  }

  private buildCandidates(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
    steps: ReasoningStep[],
  ): CandidateSolution[] {
    const max = this.config.thinking.maxCandidates;
    const baseScore = Number(
      (
        0.4 * ctx.perceptionConfidence +
        0.35 * knowledge.coverageScore +
        0.25 * Math.min(1, steps.length / 8)
      ).toFixed(4),
    );

    const candidates: CandidateSolution[] = [
      Object.freeze({
        id: randomUUID(),
        title: 'goal_aligned_reasoning',
        summary: `Reason about ${ctx.goal} using intent ${ctx.intent}`,
        rationale: steps.find((s) => s.kind === 'logical')?.inference ?? ctx.goal,
        score: baseScore,
        relatedStepIds: Object.freeze(
          steps.filter((s) => s.kind === 'logical' || s.kind === 'multi_step').map((s) => s.id),
        ),
      }),
      Object.freeze({
        id: randomUUID(),
        title: 'risk_aware_reasoning',
        summary: `Highlight unknowns and safety for ${ctx.goal}`,
        rationale: steps.find((s) => s.kind === 'causal')?.inference ?? ctx.goal,
        score: Number((baseScore * (ctx.unknownFields.length > 0 ? 0.95 : 0.85)).toFixed(4)),
        relatedStepIds: Object.freeze(
          steps.filter((s) => s.kind === 'causal' || s.kind === 'hypothesis').map((s) => s.id),
        ),
      }),
      Object.freeze({
        id: randomUUID(),
        title: 'comparative_reasoning',
        summary: `Compare observed entities relative to ${ctx.intent}`,
        rationale: steps.find((s) => s.kind === 'comparative')?.inference ?? ctx.goal,
        score: Number((baseScore * 0.9).toFixed(4)),
        relatedStepIds: Object.freeze(
          steps.filter((s) => s.kind === 'comparative').map((s) => s.id),
        ),
      }),
    ];

    for (const alt of steps.filter((s) => s.kind === 'alternative').slice(0, 2)) {
      candidates.push(
        Object.freeze({
          id: randomUUID(),
          title: 'alternative_path',
          summary: alt.inference.slice(0, 160),
          rationale: alt.inference,
          score: Number((baseScore * 0.8).toFixed(4)),
          relatedStepIds: Object.freeze([alt.id]),
        }),
      );
    }

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map((c) => Object.freeze(c));
  }
}
