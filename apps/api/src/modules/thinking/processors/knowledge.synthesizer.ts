import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IKnowledgeSynthesizer } from '../contracts/thinking.contracts';
import type { ThinkInputDto } from '../dto/think-input.dto';
import type {
  KnowledgeContext,
  KnowledgeFact,
  ThinkingContext,
} from '../models/thought.models';

/**
 * Knowledge Synthesizer — merge ThinkingContext with provided knowledge bags.
 * Never retrieves memory or calls AI services.
 */
@Injectable()
export class KnowledgeSynthesizer implements IKnowledgeSynthesizer {
  synthesize(
    thinkingContext: ThinkingContext,
    input: ThinkInputDto,
  ): KnowledgeContext {
    const facts: KnowledgeFact[] = [];
    const world = input.world;

    facts.push(
      Object.freeze({
        id: randomUUID(),
        source: 'world',
        key: 'goal',
        value: thinkingContext.goal,
        confidence: thinkingContext.perceptionConfidence,
      }),
      Object.freeze({
        id: randomUUID(),
        source: 'world',
        key: 'intent',
        value: thinkingContext.intent,
        confidence: thinkingContext.perceptionConfidence,
      }),
    );

    for (const entity of world.metadata.entities.slice(0, 20)) {
      facts.push(
        Object.freeze({
          id: randomUUID(),
          source: 'world',
          key: 'entity',
          value: entity,
          confidence: thinkingContext.perceptionConfidence,
        }),
      );
    }

    for (const unknown of world.unknowns.slice(0, 20)) {
      facts.push(
        Object.freeze({
          id: randomUUID(),
          source: 'world',
          key: `unknown:${unknown.field}`,
          value: unknown.reason,
          confidence: 0.4,
        }),
      );
    }

    for (const constraint of world.constraints.slice(0, 20)) {
      facts.push(
        Object.freeze({
          id: randomUUID(),
          source: 'world',
          key: `constraint:${constraint.type}`,
          value: constraint.description,
          confidence: 0.7,
        }),
      );
    }

    for (const item of input.providedKnowledge ?? []) {
      facts.push(
        Object.freeze({
          id: randomUUID(),
          source: 'provided',
          key: item.key,
          value: item.value,
          confidence:
            typeof item.confidence === 'number'
              ? Math.max(0, Math.min(1, item.confidence))
              : 0.6,
        }),
      );
    }

    const conversationNotes = Object.freeze([...(input.conversationContext ?? [])]);
    for (const note of conversationNotes.slice(0, 20)) {
      facts.push(
        Object.freeze({
          id: randomUUID(),
          source: 'conversation',
          key: 'conversation_note',
          value: note,
          confidence: 0.55,
        }),
      );
    }

    const systemNotes = Object.freeze([
      `thinking_engine:layer_3.2`,
      `input_type:${thinkingContext.inputType}`,
      ...(input.systemContext ?? []),
    ]);
    for (const note of systemNotes.slice(0, 20)) {
      facts.push(
        Object.freeze({
          id: randomUUID(),
          source: 'system',
          key: 'system_note',
          value: note,
          confidence: 0.9,
        }),
      );
    }

    const coverageScore = this.estimateCoverage(thinkingContext, facts);

    return Object.freeze({
      facts: Object.freeze(facts),
      conversationNotes,
      systemNotes: Object.freeze(systemNotes),
      coverageScore,
      metadata: Object.freeze({
        factCount: facts.length,
        providedCount: input.providedKnowledge?.length ?? 0,
        conversationCount: conversationNotes.length,
        unknownCount: thinkingContext.unknownFields.length,
      }),
    });
  }

  private estimateCoverage(
    thinkingContext: ThinkingContext,
    facts: KnowledgeFact[],
  ): number {
    let score = 0.35;
    if (facts.length > 0) score += 0.2;
    if (thinkingContext.objectIds.length > 0) score += 0.1;
    if (thinkingContext.unknownFields.length === 0) score += 0.15;
    else score -= Math.min(0.2, thinkingContext.unknownFields.length * 0.04);
    if (thinkingContext.perceptionConfidence >= 0.7) score += 0.1;
    return Math.max(0, Math.min(1, Number(score.toFixed(4))));
  }
}
