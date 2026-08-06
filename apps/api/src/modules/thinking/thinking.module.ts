import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  CONTEXT_BUILDER,
  CRITICAL_EVALUATOR,
  KNOWLEDGE_SYNTHESIZER,
  REASONING_CORE,
  THINKING_SERVICE,
  THOUGHT_COMPOSER,
} from './contracts';
import { ContextBuilder } from './processors/context.builder';
import { CriticalEvaluator } from './processors/critical.evaluator';
import { KnowledgeSynthesizer } from './processors/knowledge.synthesizer';
import { ReasoningCore } from './processors/reasoning.core';
import { ThoughtComposer } from './processors/thought.composer';
import { ThinkingService } from './thinking.service';

/**
 * Thinking Engine (Layer 3.2).
 * Public API: THINKING_SERVICE → IThinkingService.think()
 */
@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    MetricsModule,
    EventBusModule,
    HealthModule,
  ],
  providers: [
    ContextBuilder,
    KnowledgeSynthesizer,
    ReasoningCore,
    CriticalEvaluator,
    ThoughtComposer,
    ThinkingService,
    { provide: CONTEXT_BUILDER, useExisting: ContextBuilder },
    { provide: KNOWLEDGE_SYNTHESIZER, useExisting: KnowledgeSynthesizer },
    { provide: REASONING_CORE, useExisting: ReasoningCore },
    { provide: CRITICAL_EVALUATOR, useExisting: CriticalEvaluator },
    { provide: THOUGHT_COMPOSER, useExisting: ThoughtComposer },
    { provide: THINKING_SERVICE, useExisting: ThinkingService },
  ],
  exports: [THINKING_SERVICE],
})
export class ThinkingModule {}
