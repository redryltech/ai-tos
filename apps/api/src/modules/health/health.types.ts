import type { HealthStatus } from '@ai-tos/shared';
import type { HealthComponentName } from '@ai-tos/config';

export type ComponentCheckStatus = HealthStatus | 'skipped';

export interface ComponentHealth {
  name: HealthComponentName;
  status: ComponentCheckStatus;
  latencyMs?: number;
  message?: string;
}

export interface ProbeResult {
  status: HealthStatus;
  service: string;
  version: string;
  timestamp: string;
  components: ComponentHealth[];
}

export interface LivenessResult {
  status: 'ok';
  service: string;
  version: string;
  timestamp: string;
}
