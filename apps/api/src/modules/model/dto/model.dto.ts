import type {
  ModelAuthMode,
  ModelInferenceMode,
  ModelOptions,
} from '../models/model.models';

/** Public infer() input DTO. */
export interface ModelRequestDto {
  readonly requestId?: string;
  readonly providerId?: string;
  readonly modelId: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly options?: ModelOptions;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly traceId?: string;
  readonly authMode?: ModelAuthMode;
  readonly mode?: ModelInferenceMode;
}
