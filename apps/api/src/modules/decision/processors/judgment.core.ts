import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import type { Thought } from '../../thinking/models/thought.models';
import type { IJudgmentCore } from '../contracts/decision.contracts';
import type {
  CommitmentLevel,
  ConstraintReport,
  EvidenceReport,
  JudgmentResult,
  RejectedAlternative,
  SelectedAction,
} from '../models/decision.models';

/**
 * Judgment Core — select ONE best action from Thought candidates.
 * No planning. No execution. No new reasoning.
 */
@Injectable()
export class JudgmentCore implements IJudgmentCore {
  constructor(private readonly config: ConfigService) {}

  judge(
    thought: Thought,
    evidence: EvidenceReport,
    constraints: ConstraintReport,
  ): JudgmentResult {
    const rankedIds = thought.metadata.rankedCandidateIds ?? [];
    const candidates = [...thought.candidateSolutions].sort((a, b) => {
      const ai = rankedIds.indexOf(a.id);
      const bi = rankedIds.indexOf(b.id);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi);
      }
      return b.score - a.score;
    });

    if (candidates.length === 0) {
      throw new Error('Cannot judge Decision without candidate solutions');
    }

    const top = candidates[0]!;
    const riskPenalty = this.riskPenalty(thought);
    const evidenceBoost = 0.5 * evidence.qualityScore + 0.5 * evidence.completenessScore;
    const constraintPenalty = constraints.valid ? 0 : 0.25 + constraints.blockingCount * 0.1;

    const confidence = this.clamp(
      0.4 * thought.confidence +
        0.25 * evidenceBoost +
        0.2 * evidence.confidenceIntegrity +
        0.15 * top.score -
        riskPenalty -
        constraintPenalty,
    );

    const minConfidence = this.config.decision.minConfidence;
    const approvalThreshold = this.config.decision.approvalConfidenceThreshold;
    const approvalRequired =
      confidence < approvalThreshold ||
      !constraints.valid ||
      !evidence.valid ||
      thought.risks.some((r) => r.severity === 'high');

    const blocked = !constraints.valid && constraints.blockingCount > 0;
    const commitmentLevel = this.resolveCommitment(
      blocked,
      confidence,
      minConfidence,
      approvalRequired,
    );

    const selectedAction: SelectedAction = Object.freeze({
      id: randomUUID(),
      title: top.title,
      summary: top.summary,
      sourceCandidateId: top.id,
      score: top.score,
    });

    const rejectedAlternatives: RejectedAlternative[] = candidates.slice(1).map((c) =>
      Object.freeze({
        id: randomUUID(),
        title: c.title,
        summary: c.summary,
        sourceCandidateId: c.id,
        score: c.score,
        rejectionReason: `Lower judged score than selected action (${c.score} < ${top.score})`,
      }),
    );

    const tradeoffs = Object.freeze([
      `Selected ${top.title} over ${rejectedAlternatives.length} alternatives`,
      `Evidence quality=${evidence.qualityScore}; completeness=${evidence.completenessScore}`,
      constraints.valid
        ? 'Constraints allow commitment'
        : 'Constraints reduce commitment strength',
    ]);

    const priority =
      thought.thinkingContext?.priority ??
      (thought.risks.some((r) => r.severity === 'high') ? 'high' : 'normal');

    const decisionReason = blocked
      ? `Blocked: constraints prevent commitment to ${top.title}`
      : confidence < minConfidence
        ? `Tentative selection of ${top.title} due to confidence ${confidence} below minimum ${minConfidence}`
        : `Committed to ${top.title} as highest-ranked candidate for goal "${thought.goal}"`;

    return Object.freeze({
      selectedAction,
      rejectedAlternatives: Object.freeze(rejectedAlternatives),
      tradeoffs,
      priority,
      riskScore: this.clamp(riskPenalty + (constraints.valid ? 0 : 0.2)),
      confidence,
      approvalRequired,
      commitmentLevel,
      decisionReason,
    });
  }

  private riskPenalty(thought: Thought): number {
    let penalty = 0;
    for (const r of thought.risks) {
      if (r.severity === 'high') penalty += 0.12;
      else if (r.severity === 'warning') penalty += 0.06;
      else penalty += 0.02;
    }
    return Math.min(0.4, penalty);
  }

  private resolveCommitment(
    blocked: boolean,
    confidence: number,
    minConfidence: number,
    approvalRequired: boolean,
  ): CommitmentLevel {
    if (blocked) return 'blocked';
    if (confidence < minConfidence) return 'tentative';
    if (approvalRequired) return 'standard';
    if (confidence >= 0.85) return 'firm';
    return 'standard';
  }

  private clamp(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, Number(value.toFixed(4))));
  }
}
