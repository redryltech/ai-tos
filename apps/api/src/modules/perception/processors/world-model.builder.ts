import { Injectable } from '@nestjs/common';
import type { IWorldModelBuilder } from '../contracts/perception.contracts';
import type {
  NormalizedPerceptionInput,
  PerceptionActor,
  PerceptionEnvironment,
  PerceptionObservations,
  PerceptionUnderstanding,
  WorldUnderstanding,
} from '../models/world-understanding.models';

/**
 * World Model Builder — assemble immutable WorldUnderstanding.
 */
@Injectable()
export class WorldModelBuilder implements IWorldModelBuilder {
  build(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
    understanding: PerceptionUnderstanding,
  ): WorldUnderstanding {
    const actor = this.resolveActor(input);
    const environment = this.resolveEnvironment(input);

    return Object.freeze({
      requestId: input.requestId,
      userId: input.userId,
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      actor: Object.freeze(actor),
      goal: understanding.goal,
      objects: understanding.objects,
      relationships: understanding.relationships,
      constraints: understanding.constraints,
      unknowns: understanding.unknowns,
      environment: Object.freeze(environment),
      confidence: understanding.confidence,
      safetyObservations: understanding.safetyObservations,
      metadata: Object.freeze({
        inputType: observations.inputType,
        language: observations.language,
        intent: observations.intent,
        entities: observations.entities,
        emotion: observations.emotion,
        priority: observations.priority,
        perceivedAt: new Date().toISOString(),
        schemaVersion: '1.0.0' as const,
        extras: Object.freeze({
          ...observations.metadata,
          ...understanding.context,
          semanticMeaning: understanding.semanticMeaning,
          receivedAt: input.receivedAt,
        }),
      }),
    });
  }

  private resolveActor(input: NormalizedPerceptionInput): PerceptionActor {
    if (input.actor) {
      return {
        kind: input.actor.kind,
        id: input.actor.id ?? input.userId,
        displayName: input.actor.displayName,
      };
    }
    if (input.userId) {
      return { kind: 'user', id: input.userId };
    }
    if (input.inputType === 'event') {
      return { kind: 'system', id: 'event-source' };
    }
    if (input.inputType === 'api_request') {
      return { kind: 'service', id: 'api-client' };
    }
    return { kind: 'anonymous' };
  }

  private resolveEnvironment(input: NormalizedPerceptionInput): PerceptionEnvironment {
    const env = input.environment ?? {};
    return {
      channel: env.channel,
      locale: env.locale ?? input.languageHint,
      timezone: env.timezone,
      sourceIp: env.sourceIp,
      userAgent: env.userAgent,
      attributes: Object.freeze({ ...(env.attributes ?? {}) }),
    };
  }
}
