import type { ToolConstraints, ToolOptions } from '../models/tool.models';

/** Public execute() input DTO. */
export interface ToolRequestDto {
  readonly requestId?: string;
  readonly toolId: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly options?: ToolOptions;
  readonly constraints?: ToolConstraints;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId?: string;
}
