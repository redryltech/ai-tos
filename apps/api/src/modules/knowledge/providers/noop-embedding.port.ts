/**
 * No-op embedding port — Capability Service not implemented (Layer 4.2 stop).
 * Knowledge indexes may store embeddingRef placeholders only.
 */
import type { IEmbeddingCapabilityPort } from './knowledge.provider';

export class NoopEmbeddingCapabilityPort implements IEmbeddingCapabilityPort {
  async requestEmbeddingRefs(texts: readonly string[]): Promise<readonly string[]> {
    return Object.freeze(texts.map(() => ''));
  }
}
