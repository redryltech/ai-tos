/** Memory Service event topic constants (Layer 4.1). */

export const MEMORY_EVENTS = {
  remembered: 'memory.remembered',
  updated: 'memory.updated',
  archived: 'memory.archived',
  forgotten: 'memory.forgotten',
  failed: 'memory.failed',
} as const;

export type MemoryEventTopic = (typeof MEMORY_EVENTS)[keyof typeof MEMORY_EVENTS];
