/** Memory Service domain models (Layer 4.1). Experiences, not knowledge. */

export type MemoryKind = 'session' | 'long_term' | 'episodic';

export type MemoryStatus = 'active' | 'archived' | 'forgotten';

export type MemoryImportance = 'low' | 'normal' | 'high' | 'critical';

export interface MemoryRecord {
  readonly id: string;
  readonly kind: MemoryKind;
  readonly status: MemoryStatus;
  readonly content: string;
  readonly summary: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly tags: readonly string[];
  readonly importance: MemoryImportance;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt?: string;
  readonly archivedAt?: string;
  readonly schemaVersion: '1.0.0';
}

export interface MemoryCollection {
  readonly items: readonly MemoryRecord[];
  readonly total: number;
  readonly querySummary: string;
}

export interface MemoryEvaluation {
  readonly store: boolean;
  readonly kind: MemoryKind;
  readonly importance: MemoryImportance;
  readonly reason: string;
  readonly ttlSeconds: number | null;
  readonly discardReason?: string;
}
