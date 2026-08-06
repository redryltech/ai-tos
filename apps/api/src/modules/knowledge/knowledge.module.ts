import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigService } from '../configuration/config.service';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  DOCUMENT_LOADER,
  EMBEDDING_CAPABILITY_PORT,
  KNOWLEDGE_CONTROLLER,
  KNOWLEDGE_INDEX_MANAGER,
  KNOWLEDGE_PARSER,
  KNOWLEDGE_PROVIDER,
  KNOWLEDGE_SERVICE,
  KNOWLEDGE_STORE,
  RETRIEVAL_ENGINE,
} from './contracts';
import { KnowledgeService } from './knowledge.service';
import { DocumentLoader } from './processors/document.loader';
import { KnowledgeController } from './processors/knowledge.controller';
import { KnowledgeIndexManager } from './processors/knowledge.index-manager';
import { KnowledgeParser } from './processors/knowledge.parser';
import { KnowledgeStore } from './processors/knowledge.store';
import { RetrievalEngine } from './processors/retrieval.engine';
import { InMemoryKnowledgeProvider } from './providers/in-memory.knowledge.provider';
import { NoopEmbeddingCapabilityPort } from './providers/noop-embedding.port';

/**
 * Knowledge Service (Layer 4.2).
 * Public API: KNOWLEDGE_SERVICE → IKnowledgeService
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
    {
      provide: KNOWLEDGE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new InMemoryKnowledgeProvider(config.knowledge.maxDocuments),
    },
    { provide: EMBEDDING_CAPABILITY_PORT, useClass: NoopEmbeddingCapabilityPort },
    DocumentLoader,
    KnowledgeParser,
    KnowledgeIndexManager,
    KnowledgeStore,
    RetrievalEngine,
    KnowledgeController,
    KnowledgeService,
    { provide: DOCUMENT_LOADER, useExisting: DocumentLoader },
    { provide: KNOWLEDGE_PARSER, useExisting: KnowledgeParser },
    { provide: KNOWLEDGE_INDEX_MANAGER, useExisting: KnowledgeIndexManager },
    { provide: KNOWLEDGE_STORE, useExisting: KnowledgeStore },
    { provide: RETRIEVAL_ENGINE, useExisting: RetrievalEngine },
    { provide: KNOWLEDGE_CONTROLLER, useExisting: KnowledgeController },
    { provide: KNOWLEDGE_SERVICE, useExisting: KnowledgeService },
  ],
  exports: [KNOWLEDGE_SERVICE],
})
export class KnowledgeModule {}
