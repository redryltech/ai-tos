export type {
  IngestKnowledgeDto,
  KnowledgeQueryDto,
  UpdateKnowledgeDocumentDto,
} from './dto/knowledge.dto';
export type {
  KnowledgeCollection,
  KnowledgeDocument,
} from './models/knowledge.models';
export {
  KNOWLEDGE_SERVICE,
  type IKnowledgeService,
} from './contracts';
export { KnowledgeModule } from './knowledge.module';
export { KnowledgeService } from './knowledge.service';
export { KNOWLEDGE_EVENTS } from './events/knowledge.events';
export type { IKnowledgeProvider } from './providers/knowledge.provider';
