import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Thought } from '../../thinking/models/thought.models';
import type { ICommitmentManager } from '../contracts/decision.contracts';
import type {
  ConstraintReport,
  Decision,
  DecisionRisk,
  EvidenceReport,
  JudgmentResult,
} from '../models/decision.models';

/**
 * Commitment Manager — create immutable canonical Decision.
 * Guarantees one contract shape for every request.
 */
@Injectable()
export class CommitmentManager implements ICommitmentManager {
  commit(
    thought: Thought,
    evidence: EvidenceReport,
    constraints: ConstraintReport,
    judgment: JudgmentResult,
  ): Decision {
    const risk: DecisionRisk[] = [
      ...thought.risks.map((r) =>
        Object.freeze({
          id: randomUUID(),
          category: r.category,
          description: r.description,
          severity: r.severity === 'high' ? 'high' : r.severity === 'warning' ? 'warning' : 'info',
        } as DecisionRisk),
      ),
      ...evidence.findings
        .filter((f) => f.severity !== 'info')
        .map((f) =>
          Object.freeze({
            id: randomUUID(),
            category: `evidence:${f.category}`,
            description: f.description,
            severity: f.severity,
          } as DecisionRisk),
        ),
      ...constraints.findings
        .filter((f) => !f.passed)
        .map((f) =>
          Object.freeze({
            id: randomUUID(),
            category: `constraint:${f.category}`,
            description: f.description,
            severity: f.severity === 'blocking' ? 'blocking' : f.severity,
          } as DecisionRisk),
        ),
    ];

    const decision: Decision = Object.freeze({
      requestId: thought.requestId,
      userId: thought.userId,
      organizationId: thought.organizationId,
      goal: thought.goal,
      selectedAction: Object.freeze({ ...judgment.selectedAction }),
      rejectedAlternatives: Object.freeze(
        judgment.rejectedAlternatives.map((a) => Object.freeze({ ...a })),
      ),
      evidenceSummary: evidence.summary,
      constraintSummary: constraints.summary,
      risk: Object.freeze(risk),
      confidence: judgment.confidence,
      approvalRequired: judgment.approvalRequired,
      decisionReason: judgment.decisionReason,
      commitmentLevel: judgment.commitmentLevel,
      metadata: Object.freeze({
        schemaVersion: '1.0.0' as const,
        decidedAt: new Date().toISOString(),
        priority: judgment.priority,
        tradeoffs: Object.freeze([...judgment.tradeoffs]),
        evidenceValid: evidence.valid,
        constraintsValid: constraints.valid,
        extras: Object.freeze({
          sourceCandidateId: judgment.selectedAction.sourceCandidateId,
          rejectedCount: judgment.rejectedAlternatives.length,
          evidenceCompleteness: evidence.completenessScore,
          evidenceQuality: evidence.qualityScore,
          riskScore: judgment.riskScore,
          recommendation: thought.recommendation.slice(0, 240),
        }),
      }),
    });

    this.assertShape(decision);
    return decision;
  }

  private assertShape(decision: Decision): void {
    if (!decision.requestId) throw new Error('Decision.requestId is required');
    if (!decision.goal) throw new Error('Decision.goal is required');
    if (!decision.selectedAction?.id) throw new Error('Decision.selectedAction is required');
    if (!Array.isArray(decision.rejectedAlternatives)) {
      throw new Error('Decision.rejectedAlternatives must be an array');
    }
    if (typeof decision.evidenceSummary !== 'string') {
      throw new Error('Decision.evidenceSummary is required');
    }
    if (typeof decision.constraintSummary !== 'string') {
      throw new Error('Decision.constraintSummary is required');
    }
    if (!Array.isArray(decision.risk)) {
      throw new Error('Decision.risk must be an array');
    }
    if (typeof decision.confidence !== 'number') {
      throw new Error('Decision.confidence is required');
    }
    if (typeof decision.approvalRequired !== 'boolean') {
      throw new Error('Decision.approvalRequired is required');
    }
    if (!decision.decisionReason) throw new Error('Decision.decisionReason is required');
    if (!decision.commitmentLevel) throw new Error('Decision.commitmentLevel is required');
    if (!decision.metadata || decision.metadata.schemaVersion !== '1.0.0') {
      throw new Error('Decision.metadata.schemaVersion must be 1.0.0');
    }
  }
}
