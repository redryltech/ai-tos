import type {
  CapabilityConstraints,
  CapabilityName,
  CapabilityOptions,
} from '../models/capability.models';

/** Public execute() input DTO. */
export interface CapabilityRequestDto {
  readonly requestId?: string;
  readonly capability: CapabilityName;
  readonly input: Readonly<Record<string, unknown>>;
  readonly constraints?: CapabilityConstraints;
  readonly options?: CapabilityOptions;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId?: string;
}
