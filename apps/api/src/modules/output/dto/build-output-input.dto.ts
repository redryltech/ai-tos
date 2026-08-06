import type { ExecutionBlueprint } from '../../planning/models/execution-blueprint.models';
import type { IntentPriority } from '../models/execution-intent.models';

/**
 * Public buildOutput() input — ExecutionBlueprint from Planning Engine.
 * Optional outputHints are local consolidation hints only.
 */
export interface BuildOutputInputDto {
  readonly blueprint: ExecutionBlueprint;
  readonly outputHints?: Readonly<{
    readonly priority?: IntentPriority;
    readonly traceId?: string;
    readonly extraCapabilities?: ReadonlyArray<string>;
  }>;
}
