import type { Thought } from '../../thinking/models/thought.models';

/**
 * Public decide() input — Thought from Thinking Engine.
 * Optional policyHints are local validation hints only (never fetched).
 */
export interface DecideInputDto {
  readonly thought: Thought;
  readonly policyHints?: Readonly<{
    readonly requireOrganization?: boolean;
    readonly requireUser?: boolean;
    readonly maxRiskSeverity?: 'info' | 'warning' | 'high';
    readonly permissionLevel?: 'none' | 'read' | 'write' | 'admin';
  }>;
}
