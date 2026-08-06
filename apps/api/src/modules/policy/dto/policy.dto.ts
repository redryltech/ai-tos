import type { PolicyScopeLevel } from '../models/policy.models';

/** Public resolve() input DTO. */
export interface PolicyRequestDto {
  readonly requestId?: string;
  readonly scope?: Partial<Record<PolicyScopeLevel, string | undefined>>;
  readonly subject?: Readonly<Record<string, string | number | boolean | null>>;
  readonly resource: string;
  readonly context?: Readonly<Record<string, string | number | boolean | null>>;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId?: string;
}
