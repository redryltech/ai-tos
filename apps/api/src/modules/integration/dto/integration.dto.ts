import type { IntegrationOptions } from '../models/integration.models';

/** Public execute() input DTO. */
export interface IntegrationRequestDto {
  readonly requestId?: string;
  readonly connectorId: string;
  readonly operation: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly options?: IntegrationOptions;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId?: string;
}
