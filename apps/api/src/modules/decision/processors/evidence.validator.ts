import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Thought } from '../../thinking/models/thought.models';
import type { IEvidenceValidator } from '../contracts/decision.contracts';
import type { EvidenceFinding, EvidenceReport } from '../models/decision.models';

/**
 * Evidence Validator — validate Thought evidence integrity.
 * Never generates new reasoning.
 */
@Injectable()
export class EvidenceValidator implements IEvidenceValidator {
  validate(thought: Thought): EvidenceReport {
    if (!thought || typeof thought !== 'object') {
      throw new Error('Thought is required');
    }
    if (!thought.requestId) {
      throw new Error('Thought.requestId is required');
    }

    const findings: EvidenceFinding[] = [];
    const missingEvidence: string[] = [...(thought.metadata.missingInformation ?? [])];
    const contradictions: string[] = [];

    const stepCount = thought.reasoning?.steps?.length ?? 0;
    const candidateCount = thought.candidateSolutions?.length ?? 0;
    const factCount = thought.knowledgeContext?.facts?.length ?? 0;

    if (stepCount < 3) {
      findings.push(
        Object.freeze({
          id: randomUUID(),
          category: 'completeness',
          description: `Reasoning steps incomplete (${stepCount})`,
          severity: 'warning',
        }),
      );
      missingEvidence.push('reasoning_steps');
    }

    if (candidateCount === 0) {
      findings.push(
        Object.freeze({
          id: randomUUID(),
          category: 'missing',
          description: 'No candidate solutions present in Thought',
          severity: 'high',
        }),
      );
      missingEvidence.push('candidate_solutions');
    }

    if (factCount === 0) {
      findings.push(
        Object.freeze({
          id: randomUUID(),
          category: 'quality',
          description: 'Knowledge context has no facts',
          severity: 'warning',
        }),
      );
      missingEvidence.push('knowledge_facts');
    }

    if (!Number.isFinite(thought.confidence) || thought.confidence < 0 || thought.confidence > 1) {
      findings.push(
        Object.freeze({
          id: randomUUID(),
          category: 'confidence',
          description: 'Thought confidence is outside [0,1]',
          severity: 'high',
        }),
      );
    }

    const evalConfidence = thought.metadata.evaluation?.confidence;
    if (
      typeof evalConfidence === 'number' &&
      Math.abs(evalConfidence - thought.confidence) > 0.25
    ) {
      contradictions.push('thought.confidence diverges from evaluation.confidence');
      findings.push(
        Object.freeze({
          id: randomUUID(),
          category: 'contradiction',
          description: 'Confidence values diverge between Thought and evaluation metadata',
          severity: 'warning',
        }),
      );
    }

    const ranked = thought.metadata.rankedCandidateIds ?? [];
    if (ranked.length > 0 && candidateCount > 0) {
      const ids = new Set(thought.candidateSolutions.map((c) => c.id));
      if (!ranked.every((id) => ids.has(id))) {
        contradictions.push('rankedCandidateIds reference unknown candidates');
        findings.push(
          Object.freeze({
            id: randomUUID(),
            category: 'contradiction',
            description: 'Ranked candidate ids do not match candidateSolutions',
            severity: 'high',
          }),
        );
      }
    }

    const completenessScore = this.clamp(
      0.35 * Math.min(1, stepCount / 6) +
        0.35 * Math.min(1, candidateCount / 3) +
        0.3 * Math.min(1, factCount / 5) -
        Math.min(0.3, missingEvidence.length * 0.05),
    );
    const qualityScore = this.clamp(
      0.5 * (thought.knowledgeContext?.coverageScore ?? 0) +
        0.3 * (thought.metadata.evaluation?.quality ?? thought.confidence) +
        0.2 * (contradictions.length === 0 ? 1 : 0.4),
    );
    const confidenceIntegrity = this.clamp(
      Number.isFinite(thought.confidence) && thought.confidence >= 0 && thought.confidence <= 1
        ? 1 - contradictions.length * 0.15
        : 0.2,
    );

    const highFindings = findings.filter((f) => f.severity === 'high').length;
    const valid =
      candidateCount > 0 &&
      highFindings === 0 &&
      completenessScore >= 0.35 &&
      confidenceIntegrity >= 0.4;

    return Object.freeze({
      valid,
      completenessScore,
      qualityScore,
      confidenceIntegrity,
      missingEvidence: Object.freeze([...new Set(missingEvidence)]),
      contradictions: Object.freeze(contradictions),
      findings: Object.freeze(findings),
      summary: valid
        ? `Evidence acceptable (completeness=${completenessScore}, quality=${qualityScore})`
        : `Evidence insufficient or inconsistent (missing=${missingEvidence.length}, contradictions=${contradictions.length})`,
    });
  }

  private clamp(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, Number(value.toFixed(4))));
  }
}
