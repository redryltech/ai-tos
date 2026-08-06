import { Injectable } from '@nestjs/common';
import type { WorldUnderstanding } from '../../perception/models/world-understanding.models';
import type { IContextBuilder } from '../contracts/thinking.contracts';
import type { ThinkingContext } from '../models/thought.models';

/**
 * Context Builder — normalize WorldUnderstanding into ThinkingContext.
 * No reasoning.
 */
@Injectable()
export class ContextBuilder implements IContextBuilder {
  build(world: WorldUnderstanding): ThinkingContext {
    if (!world || typeof world !== 'object') {
      throw new Error('WorldUnderstanding is required');
    }
    if (!world.requestId || typeof world.requestId !== 'string') {
      throw new Error('WorldUnderstanding.requestId is required');
    }
    if (!world.goal || typeof world.goal !== 'string') {
      throw new Error('WorldUnderstanding.goal is required');
    }

    const envAttrs = world.environment?.attributes ?? {};
    return Object.freeze({
      requestId: world.requestId,
      userId: world.userId,
      organizationId: world.organizationId,
      sessionId: world.sessionId,
      goal: world.goal,
      intent: world.metadata.intent,
      language: world.metadata.language,
      priority: world.metadata.priority,
      emotion: world.metadata.emotion,
      inputType: world.metadata.inputType,
      objectIds: Object.freeze(world.objects.map((o) => o.id)),
      relationshipIds: Object.freeze(world.relationships.map((r) => r.id)),
      constraintIds: Object.freeze(world.constraints.map((c) => c.id)),
      unknownFields: Object.freeze(world.unknowns.map((u) => u.field)),
      safetyCategories: Object.freeze(world.safetyObservations.map((s) => s.category)),
      perceptionConfidence: world.confidence,
      environment: Object.freeze({
        channel: world.environment.channel ?? null,
        locale: world.environment.locale ?? null,
        timezone: world.environment.timezone ?? null,
        ...envAttrs,
      }),
      metadata: Object.freeze({
        schemaVersion: world.metadata.schemaVersion,
        perceivedAt: world.metadata.perceivedAt,
        entityCount: world.metadata.entities.length,
        actorKind: world.actor.kind,
        actorId: world.actor.id ?? null,
      }),
      builtAt: new Date().toISOString(),
    });
  }
}
