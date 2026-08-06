import { Injectable } from '@nestjs/common';
import type { IOutputStandardizer } from '../contracts/perception.contracts';
import type {
  PerceptionInputType,
  WorldUnderstanding,
} from '../models/world-understanding.models';

const REQUIRED_INPUT_TYPES: ReadonlySet<PerceptionInputType> = new Set([
  'text',
  'image',
  'audio',
  'video',
  'pdf',
  'website',
  'json',
  'api_request',
  'event',
]);

/**
 * Output Standardizer — validate and guarantee one canonical WorldUnderstanding.
 */
@Injectable()
export class OutputStandardizer implements IOutputStandardizer {
  standardize(candidate: WorldUnderstanding): WorldUnderstanding {
    this.assertShape(candidate);

    return Object.freeze({
      requestId: candidate.requestId,
      userId: candidate.userId,
      organizationId: candidate.organizationId,
      sessionId: candidate.sessionId,
      actor: Object.freeze({ ...candidate.actor }),
      goal: candidate.goal,
      objects: Object.freeze(candidate.objects.map((o) => Object.freeze({ ...o, attributes: Object.freeze({ ...o.attributes }) }))),
      relationships: Object.freeze(
        candidate.relationships.map((r) =>
          Object.freeze({ ...r, attributes: Object.freeze({ ...r.attributes }) }),
        ),
      ),
      constraints: Object.freeze(candidate.constraints.map((c) => Object.freeze({ ...c }))),
      unknowns: Object.freeze(candidate.unknowns.map((u) => Object.freeze({ ...u }))),
      environment: Object.freeze({
        ...candidate.environment,
        attributes: Object.freeze({ ...candidate.environment.attributes }),
      }),
      confidence: this.clampConfidence(candidate.confidence),
      safetyObservations: Object.freeze(
        candidate.safetyObservations.map((s) => Object.freeze({ ...s })),
      ),
      metadata: Object.freeze({
        inputType: candidate.metadata.inputType,
        language: candidate.metadata.language,
        intent: candidate.metadata.intent,
        entities: Object.freeze([...candidate.metadata.entities]),
        emotion: candidate.metadata.emotion,
        priority: candidate.metadata.priority,
        perceivedAt: candidate.metadata.perceivedAt,
        schemaVersion: '1.0.0' as const,
        extras: Object.freeze({ ...candidate.metadata.extras }),
      }),
    });
  }

  private clampConfidence(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, Number(value.toFixed(4))));
  }

  private assertShape(candidate: WorldUnderstanding): void {
    if (!candidate || typeof candidate !== 'object') {
      throw new Error('WorldUnderstanding is required');
    }
    if (!candidate.requestId || typeof candidate.requestId !== 'string') {
      throw new Error('WorldUnderstanding.requestId is required');
    }
    if (!candidate.actor || typeof candidate.actor.kind !== 'string') {
      throw new Error('WorldUnderstanding.actor is required');
    }
    if (typeof candidate.goal !== 'string' || candidate.goal.length === 0) {
      throw new Error('WorldUnderstanding.goal is required');
    }
    if (!Array.isArray(candidate.objects)) {
      throw new Error('WorldUnderstanding.objects must be an array');
    }
    if (!Array.isArray(candidate.relationships)) {
      throw new Error('WorldUnderstanding.relationships must be an array');
    }
    if (!Array.isArray(candidate.constraints)) {
      throw new Error('WorldUnderstanding.constraints must be an array');
    }
    if (!Array.isArray(candidate.unknowns)) {
      throw new Error('WorldUnderstanding.unknowns must be an array');
    }
    if (!candidate.environment || typeof candidate.environment !== 'object') {
      throw new Error('WorldUnderstanding.environment is required');
    }
    if (!Array.isArray(candidate.safetyObservations)) {
      throw new Error('WorldUnderstanding.safetyObservations must be an array');
    }
    if (!candidate.metadata || candidate.metadata.schemaVersion !== '1.0.0') {
      throw new Error('WorldUnderstanding.metadata.schemaVersion must be 1.0.0');
    }
    if (!REQUIRED_INPUT_TYPES.has(candidate.metadata.inputType)) {
      throw new Error('WorldUnderstanding.metadata.inputType is invalid');
    }
  }
}
