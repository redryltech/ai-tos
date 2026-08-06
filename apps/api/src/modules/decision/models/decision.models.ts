/** Decision Engine domain models (Layer 3.3). Immutable typed contracts. */

export type CommitmentLevel = 'tentative' | 'standard' | 'firm' | 'blocked';

export type DecisionRiskSeverity = 'info' | 'warning' | 'high' | 'blocking';

export interface EvidenceFinding {
  readonly id: string;
  readonly category:
    | 'completeness'
    | 'quality'
    | 'confidence'
    | 'missing'
    | 'contradiction';
  readonly description: string;
  readonly severity: 'info' | 'warning' | 'high';
}

export interface EvidenceReport {
  readonly valid: boolean;
  readonly completenessScore: number;
  readonly qualityScore: number;
  readonly confidenceIntegrity: number;
  readonly missingEvidence: readonly string[];
  readonly contradictions: readonly string[];
  readonly findings: readonly EvidenceFinding[];
  readonly summary: string;
}

export interface ConstraintFinding {
  readonly id: string;
  readonly category:
    | 'business'
    | 'safety'
    | 'organization'
    | 'permission'
    | 'operational'
    | 'compliance';
  readonly description: string;
  readonly severity: 'info' | 'warning' | 'high' | 'blocking';
  readonly passed: boolean;
}

export interface ConstraintReport {
  readonly valid: boolean;
  readonly blockingCount: number;
  readonly findings: readonly ConstraintFinding[];
  readonly summary: string;
}

export interface SelectedAction {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly sourceCandidateId: string;
  readonly score: number;
}

export interface RejectedAlternative {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly sourceCandidateId: string;
  readonly score: number;
  readonly rejectionReason: string;
}

export interface JudgmentResult {
  readonly selectedAction: SelectedAction;
  readonly rejectedAlternatives: readonly RejectedAlternative[];
  readonly tradeoffs: readonly string[];
  readonly priority: string;
  readonly riskScore: number;
  readonly confidence: number;
  readonly approvalRequired: boolean;
  readonly commitmentLevel: CommitmentLevel;
  readonly decisionReason: string;
}

export interface DecisionRisk {
  readonly id: string;
  readonly category: string;
  readonly description: string;
  readonly severity: DecisionRiskSeverity;
}

/** Canonical Decision Engine output — identical structure for every request. */
export interface Decision {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly goal: string;
  readonly selectedAction: SelectedAction;
  readonly rejectedAlternatives: readonly RejectedAlternative[];
  readonly evidenceSummary: string;
  readonly constraintSummary: string;
  readonly risk: readonly DecisionRisk[];
  readonly confidence: number;
  readonly approvalRequired: boolean;
  readonly decisionReason: string;
  readonly commitmentLevel: CommitmentLevel;
  readonly metadata: Readonly<{
    schemaVersion: '1.0.0';
    decidedAt: string;
    priority: string;
    tradeoffs: readonly string[];
    evidenceValid: boolean;
    constraintsValid: boolean;
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
}
