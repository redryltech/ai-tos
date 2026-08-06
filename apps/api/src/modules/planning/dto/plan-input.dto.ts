import type { Decision } from '../../decision/models/decision.models';

/**
 * Public plan() input — Decision from Decision Engine.
 * Optional planHints are local design hints only (never scheduled/executed).
 */
export interface PlanInputDto {
  readonly decision: Decision;
  readonly planHints?: Readonly<{
    readonly preferParallel?: boolean;
    readonly includeVerification?: boolean;
    readonly maxTasks?: number;
  }>;
}
