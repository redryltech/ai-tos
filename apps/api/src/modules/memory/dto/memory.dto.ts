import type { MemoryImportance, MemoryKind } from '../models/memory.models';

/** Input for remember() — experience payload only. */
export interface RememberMemoryDto {
  readonly id?: string;
  readonly content: string;
  readonly summary?: string;
  readonly kindHint?: MemoryKind;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly tags?: readonly string[];
  readonly importanceHint?: MemoryImportance;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

/** Input for update() — identity + mutable fields. */
export interface UpdateMemoryDto {
  readonly id: string;
  readonly content?: string;
  readonly summary?: string;
  readonly tags?: readonly string[];
  readonly importance?: MemoryImportance;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly kind?: MemoryKind;
}

/** Query for recall() / search(). */
export interface MemoryQueryDto {
  readonly text?: string;
  readonly kind?: MemoryKind;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly tags?: readonly string[];
  readonly includeArchived?: boolean;
  readonly limit?: number;
}
