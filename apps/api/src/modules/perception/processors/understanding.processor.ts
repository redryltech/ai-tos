import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IUnderstandingProcessor } from '../contracts/perception.contracts';
import type {
  NormalizedPerceptionInput,
  PerceptionObservations,
  PerceptionUnderstanding,
  SafetyObservation,
  WorldConstraint,
  WorldObject,
  WorldRelationship,
  WorldUnknown,
} from '../models/world-understanding.models';

/**
 * Understanding Processor — transform observations into understanding.
 * Relationships, constraints, context, unknowns, safety, semantic meaning.
 * No reasoning. No planning.
 */
@Injectable()
export class UnderstandingProcessor implements IUnderstandingProcessor {
  process(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
  ): PerceptionUnderstanding {
    const objects = this.buildObjects(input, observations);
    const relationships = this.buildRelationships(objects, observations);
    const constraints = this.buildConstraints(input, observations);
    const unknowns = this.buildUnknowns(input, observations);
    const safetyObservations = this.buildSafety(input, observations);
    const semanticMeaning = this.buildSemanticMeaning(input, observations);
    const confidence = this.estimateConfidence(input, observations, unknowns);

    return Object.freeze({
      relationships: Object.freeze(relationships),
      constraints: Object.freeze(constraints),
      context: Object.freeze({
        intent: observations.intent,
        language: observations.language,
        emotion: observations.emotion,
        priority: observations.priority,
        inputType: observations.inputType,
        sessionPresent: Boolean(input.sessionId),
        organizationPresent: Boolean(input.organizationId),
      }),
      unknowns: Object.freeze(unknowns),
      safetyObservations: Object.freeze(safetyObservations),
      semanticMeaning,
      objects: Object.freeze(objects),
      goal: this.deriveGoal(observations),
      confidence,
    });
  }

  private buildObjects(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
  ): WorldObject[] {
    const objects: WorldObject[] = [
      Object.freeze({
        id: 'primary-input',
        type: observations.inputType,
        label: 'primary_input',
        attributes: Object.freeze({
          contentPreview: input.content.slice(0, 240),
          uri: input.uri ?? null,
          mimeType: input.mimeType ?? null,
        }),
      }),
    ];

    for (const [index, entity] of observations.entities.entries()) {
      objects.push(
        Object.freeze({
          id: `entity-${index + 1}`,
          type: 'entity',
          label: entity,
          attributes: Object.freeze({ value: entity }),
        }),
      );
    }

    return objects;
  }

  private buildRelationships(
    objects: WorldObject[],
    observations: PerceptionObservations,
  ): WorldRelationship[] {
    const primary = objects[0];
    if (!primary) return [];
    const relationships: WorldRelationship[] = [];
    for (const obj of objects.slice(1)) {
      relationships.push(
        Object.freeze({
          id: randomUUID(),
          type: 'mentions',
          fromObjectId: primary.id,
          toObjectId: obj.id,
          attributes: Object.freeze({ intent: observations.intent }),
        }),
      );
    }
    return relationships;
  }

  private buildConstraints(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
  ): WorldConstraint[] {
    const constraints: WorldConstraint[] = [];
    if (!input.userId) {
      constraints.push(
        Object.freeze({
          id: randomUUID(),
          type: 'identity',
          description: 'userId not provided on perception input',
          severity: 'info',
        }),
      );
    }
    if (observations.priority === 'critical') {
      constraints.push(
        Object.freeze({
          id: randomUUID(),
          type: 'priority',
          description: 'critical priority observed in input',
          severity: 'warning',
        }),
      );
    }
    return constraints;
  }

  private buildUnknowns(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
  ): WorldUnknown[] {
    const unknowns: WorldUnknown[] = [];
    if (!input.organizationId) {
      unknowns.push(
        Object.freeze({
          id: randomUUID(),
          field: 'organizationId',
          reason: 'missing from input',
        }),
      );
    }
    if (!input.sessionId) {
      unknowns.push(
        Object.freeze({
          id: randomUUID(),
          field: 'sessionId',
          reason: 'missing from input',
        }),
      );
    }
    if (observations.entities.length === 0 && input.content.trim().length > 0) {
      unknowns.push(
        Object.freeze({
          id: randomUUID(),
          field: 'entities',
          reason: 'no extractable entities detected',
        }),
      );
    }
    return unknowns;
  }

  private buildSafety(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
  ): SafetyObservation[] {
    const safety: SafetyObservation[] = [];
    const lower = input.content.toLowerCase();
    if (/\b(password|secret|api[_-]?key|bearer\s+[a-z0-9._-]+)\b/i.test(lower)) {
      safety.push(
        Object.freeze({
          id: randomUUID(),
          category: 'credential_leak_pattern',
          description: 'possible credential-like token pattern observed in content',
          severity: 'high',
        }),
      );
    }
    if (observations.emotion === 'urgent') {
      safety.push(
        Object.freeze({
          id: randomUUID(),
          category: 'urgency',
          description: 'urgent emotional tone observed',
          severity: 'warning',
        }),
      );
    }
    return safety;
  }

  private buildSemanticMeaning(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
  ): string {
    const preview = input.content.trim().slice(0, 160);
    return `Observed ${observations.inputType} input with intent=${observations.intent}; language=${observations.language}; preview=${preview}`;
  }

  private deriveGoal(observations: PerceptionObservations): string {
    return `understand:${observations.intent}`;
  }

  private estimateConfidence(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
    unknowns: WorldUnknown[],
  ): number {
    let score = 0.55;
    if (input.content.trim().length > 0) score += 0.15;
    if (observations.entities.length > 0) score += 0.1;
    if (input.languageHint) score += 0.05;
    if (input.userId) score += 0.05;
    if (input.organizationId) score += 0.05;
    score -= Math.min(0.2, unknowns.length * 0.04);
    return Math.max(0, Math.min(1, Number(score.toFixed(4))));
  }
}
