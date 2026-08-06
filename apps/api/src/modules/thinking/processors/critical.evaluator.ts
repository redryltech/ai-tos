import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ICriticalEvaluator } from '../contracts/thinking.contracts';
import type {
  EvaluatedThought,
  KnowledgeContext,
  ReasoningBundle,
  ThinkingContext,
  ThoughtRisk,
} from '../models/thought.models';

/**
 * Critical Evaluator — score quality / confidence / risk / completeness /
 * consistency; surface missing info and weak assumptions.
 * Never decides.
 */
@Injectable()
export class CriticalEvaluator implements ICriticalEvaluator {
  evaluate(
    thinkingContext: ThinkingContext,
    knowledge: KnowledgeContext,
    reasoning: ReasoningBundle,
  ): EvaluatedThought {
    const missingInformation = Object.freeze([
      ...thinkingContext.unknownFields.map((f) => `missing:${f}`),
      ...(knowledge.coverageScore < 0.5 ? ['knowledge_coverage_low'] : []),
    ]);

    const weakAssumptions = Object.freeze(
      reasoning.assumptions.filter(
        (a) =>
          a.includes('unspecified') ||
          a.includes('anonymous') ||
          a.includes('faithful observation'),
      ),
    );

    const risks = Object.freeze(this.buildRisks(thinkingContext, knowledge, reasoning));
    const ranked = [...reasoning.candidateSolutions]
      .sort((a, b) => b.score - a.score)
      .map((c) => c.id);

    const quality = this.clamp(
      0.35 * Math.min(1, reasoning.steps.length / 6) +
        0.35 * knowledge.coverageScore +
        0.3 * thinkingContext.perceptionConfidence,
    );
    const completeness = this.clamp(
      1 - Math.min(0.6, missingInformation.length * 0.1) + (ranked.length > 0 ? 0.1 : 0),
    );
    const consistency = this.clamp(
      reasoning.candidateSolutions.length > 0 &&
        new Set(reasoning.steps.map((s) => s.kind)).size >= 3
        ? 0.8
        : 0.55,
    );
    const riskScore = this.clamp(
      risks.reduce((acc, r) => acc + (r.severity === 'high' ? 0.25 : r.severity === 'warning' ? 0.12 : 0.05), 0),
    );
    const confidence = this.clamp(
      0.4 * quality + 0.25 * completeness + 0.2 * consistency + 0.15 * (1 - riskScore),
    );

    const top = reasoning.candidateSolutions.find((c) => c.id === ranked[0]);
    const recommendation = top
      ? `Strongest reasoned direction: ${top.title} — ${top.summary}`
      : `Insufficient candidates to recommend a reasoned direction for ${thinkingContext.goal}`;

    return Object.freeze({
      reasoning,
      scores: Object.freeze({
        quality,
        confidence,
        risk: riskScore,
        completeness,
        consistency,
      }),
      missingInformation,
      weakAssumptions,
      risks,
      rankedCandidateIds: Object.freeze(ranked),
      recommendation,
    });
  }

  private buildRisks(
    ctx: ThinkingContext,
    knowledge: KnowledgeContext,
    reasoning: ReasoningBundle,
  ): ThoughtRisk[] {
    const risks: ThoughtRisk[] = [];
    if (ctx.safetyCategories.includes('credential_leak_pattern')) {
      risks.push(
        Object.freeze({
          id: randomUUID(),
          category: 'safety',
          description: 'Credential-like pattern observed upstream in perception',
          severity: 'high',
        }),
      );
    }
    if (knowledge.coverageScore < 0.45) {
      risks.push(
        Object.freeze({
          id: randomUUID(),
          category: 'knowledge_gap',
          description: 'Knowledge coverage is low; conclusions may be brittle',
          severity: 'warning',
        }),
      );
    }
    if (reasoning.assumptions.length > 3) {
      risks.push(
        Object.freeze({
          id: randomUUID(),
          category: 'assumption_load',
          description: 'Multiple assumptions underpin candidate thoughts',
          severity: 'info',
        }),
      );
    }
    if (ctx.priority === 'critical') {
      risks.push(
        Object.freeze({
          id: randomUUID(),
          category: 'priority',
          description: 'Critical priority observed; reasoning urgency is elevated',
          severity: 'warning',
        }),
      );
    }
    return risks;
  }

  private clamp(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, Number(value.toFixed(4))));
  }
}
