/** Knowledge Service event topic constants (Layer 4.2). */

export const KNOWLEDGE_EVENTS = {
  ingested: 'knowledge.ingested',
  updated: 'knowledge.updated',
  deleted: 'knowledge.deleted',
  retrieved: 'knowledge.retrieved',
  searchCompleted: 'knowledge.search.completed',
  failed: 'knowledge.failed',
} as const;

export type KnowledgeEventTopic =
  (typeof KNOWLEDGE_EVENTS)[keyof typeof KNOWLEDGE_EVENTS];
