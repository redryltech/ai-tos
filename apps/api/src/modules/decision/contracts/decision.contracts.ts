import type { Thought } from '../../thinking/models/thought.models';
import type { DecideInputDto } from '../dto/decide-input.dto';
import type {
  ConstraintReport,
  Decision,
  EvidenceReport,
  JudgmentResult,
} from '../models/decision.models';

export const EVIDENCE_VALIDATOR = Symbol('EVIDENCE_VALIDATOR');
export const CONSTRAINT_VALIDATOR = Symbol('CONSTRAINT_VALIDATOR');
export const JUDGMENT_CORE = Symbol('JUDGMENT_CORE');
export const COMMITMENT_MANAGER = Symbol('COMMITMENT_MANAGER');
export const DECISION_SERVICE = Symbol('DECISION_SERVICE');

export interface IEvidenceValidator {
  validate(thought: Thought): EvidenceReport;
}

export interface IConstraintValidator {
  validate(thought: Thought, input: DecideInputDto): ConstraintReport;
}

export interface IJudgmentCore {
  judge(
    thought: Thought,
    evidence: EvidenceReport,
    constraints: ConstraintReport,
  ): JudgmentResult;
}

export interface ICommitmentManager {
  commit(
    thought: Thought,
    evidence: EvidenceReport,
    constraints: ConstraintReport,
    judgment: JudgmentResult,
  ): Decision;
}

/** Sole public Decision Engine contract: decide(thought) → Decision. */
export interface IDecisionService {
  decide(input: Thought | DecideInputDto): Promise<Decision>;
}
