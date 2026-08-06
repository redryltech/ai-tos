import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Thought } from '../../thinking/models/thought.models';
import type { IConstraintValidator } from '../contracts/decision.contracts';
import type { DecideInputDto } from '../dto/decide-input.dto';
import type { ConstraintFinding, ConstraintReport } from '../models/decision.models';

/**
 * Constraint Validator — validate business/safety/org/permission/ops/compliance.
 * Never modifies Thought.
 */
@Injectable()
export class ConstraintValidator implements IConstraintValidator {
  validate(thought: Thought, input: DecideInputDto): ConstraintReport {
    const findings: ConstraintFinding[] = [];
    const hints = input.policyHints ?? {};

    findings.push(
      Object.freeze({
        id: randomUUID(),
        category: 'business',
        description: thought.goal
          ? `Goal present: ${thought.goal}`
          : 'Goal missing from Thought',
        severity: thought.goal ? 'info' : 'blocking',
        passed: Boolean(thought.goal),
      }),
    );

    const highSafety = thought.risks.some(
      (r) => r.severity === 'high' || r.category === 'safety',
    );
    findings.push(
      Object.freeze({
        id: randomUUID(),
        category: 'safety',
        description: highSafety
          ? 'High safety risk present in Thought risks'
          : 'No high safety risks observed in Thought',
        severity: highSafety ? 'high' : 'info',
        passed: !highSafety,
      }),
    );

    const requireOrg = hints.requireOrganization === true;
    const orgOk = !requireOrg || Boolean(thought.organizationId);
    findings.push(
      Object.freeze({
        id: randomUUID(),
        category: 'organization',
        description: orgOk
          ? 'Organization policy check passed'
          : 'Organization id required by policy but missing',
        severity: orgOk ? 'info' : 'blocking',
        passed: orgOk,
      }),
    );

    const requireUser = hints.requireUser === true;
    const userOk = !requireUser || Boolean(thought.userId);
    findings.push(
      Object.freeze({
        id: randomUUID(),
        category: 'permission',
        description: userOk
          ? `User permission baseline ok (level=${hints.permissionLevel ?? 'read'})`
          : 'User id required by policy but missing',
        severity: userOk ? 'info' : 'blocking',
        passed: userOk,
      }),
    );

    const maxRisk = hints.maxRiskSeverity ?? 'high';
    const severityRank = { info: 0, warning: 1, high: 2 } as const;
    const thoughtMax = thought.risks.reduce(
      (acc, r) => Math.max(acc, severityRank[r.severity] ?? 0),
      0,
    );
    const opsOk = thoughtMax <= severityRank[maxRisk];
    findings.push(
      Object.freeze({
        id: randomUUID(),
        category: 'operational',
        description: opsOk
          ? `Operational risk within limit (${maxRisk})`
          : `Operational risk exceeds configured max (${maxRisk})`,
        severity: opsOk ? 'info' : 'blocking',
        passed: opsOk,
      }),
    );

    const complianceBlocked = thought.constraints.some((c) =>
      /compliance|forbidden|blocked/i.test(c),
    );
    findings.push(
      Object.freeze({
        id: randomUUID(),
        category: 'compliance',
        description: complianceBlocked
          ? 'Compliance-oriented constraint detected in Thought'
          : 'No explicit compliance block markers in Thought constraints',
        severity: complianceBlocked ? 'high' : 'info',
        passed: !complianceBlocked,
      }),
    );

    const blockingCount = findings.filter(
      (f) => !f.passed && (f.severity === 'blocking' || f.severity === 'high'),
    ).length;
    const valid = findings.every((f) => f.passed || f.severity === 'info' || f.severity === 'warning');

    return Object.freeze({
      valid,
      blockingCount,
      findings: Object.freeze(findings),
      summary: valid
        ? `Constraints satisfied (${findings.length} checks)`
        : `Constraint violations detected (blocking_or_high=${blockingCount})`,
    });
  }
}
