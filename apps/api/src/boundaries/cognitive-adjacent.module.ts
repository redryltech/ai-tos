import { Module } from '@nestjs/common';
import { PerceptionModule } from '../modules/perception/perception.module';
import { ThinkingModule } from '../modules/thinking/thinking.module';
import { DecisionModule } from '../modules/decision/decision.module';
import { PlanningModule } from '../modules/planning/planning.module';
import { OutputModule } from '../modules/output/output.module';
import { MemoryModule } from '../modules/memory/memory.module';
import { KnowledgeModule } from '../modules/knowledge/knowledge.module';

/**
 * Cognitive / product-adjacent composition boundary.
 *
 * These modules remain in the monorepo for isolation and future ATI/product
 * rebinding. They are NOT AI-TOS Platform SA ownership (no Platform Brain,
 * no Universal Decision/Memory/World-Model owner, no ATI absorption into SA).
 *
 * Seams preserved:
 * - Persistence ≠ Memory / Truth / World Model
 * - Access (RBAC) ≠ Business Decision
 * - Workflow construction ≠ Runtime execution
 * - Platform ≠ ATI Product
 */
@Module({
  imports: [
    PerceptionModule,
    ThinkingModule,
    DecisionModule,
    PlanningModule,
    OutputModule,
    MemoryModule,
    KnowledgeModule,
  ],
})
export class CognitiveAdjacentModule {}
