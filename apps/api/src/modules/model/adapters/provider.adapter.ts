import type {
  ModelRequest,
  ModelResponse,
  ProviderDescriptor,
} from '../models/model.models';

/**
 * Provider Adapter interface — hides vendor-specific APIs.
 * Implementations MUST NOT call real vendor SDKs in this phase;
 * they provide deterministic provider-shaped abstractions only.
 */
export interface IProviderAdapter {
  readonly adapterId: string;
  readonly providerId: string;
  supports(modelId: string): boolean;
  infer(request: ModelRequest): Promise<ModelResponse>;
  descriptor(): ProviderDescriptor;
}
