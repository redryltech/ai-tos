import type { ModelRequestDto } from '../dto/model.dto';
import type {
  ModelRequest,
  ModelResponse,
  ProviderCredential,
  ProviderDescriptor,
  ProviderHealthSnapshot,
  ProviderRegistration,
  UsageRecord,
} from '../models/model.models';
import type { IProviderAdapter } from '../adapters/provider.adapter';

export const MODEL_SERVICE = Symbol('MODEL_SERVICE');
export const MODEL_CONTROLLER = Symbol('MODEL_CONTROLLER');
export const PROVIDER_REGISTRY = Symbol('PROVIDER_REGISTRY');
export const AUTHENTICATION_MANAGER = Symbol('AUTHENTICATION_MANAGER');
export const INFERENCE_EXECUTOR = Symbol('INFERENCE_EXECUTOR');
export const PROVIDER_HEALTH_MONITOR = Symbol('PROVIDER_HEALTH_MONITOR');
export const USAGE_COLLECTOR = Symbol('USAGE_COLLECTOR');
export const PROVIDER_ADAPTERS = Symbol('PROVIDER_ADAPTERS');

export interface IProviderRegistry {
  register(registration: ProviderRegistration): void;
  unregister(providerId: string): boolean;
  get(providerId: string): ProviderRegistration | undefined;
  list(): readonly ProviderRegistration[];
  listDescriptors(): readonly ProviderDescriptor[];
  setAvailable(providerId: string, available: boolean): void;
}

export interface IAuthenticationManager {
  store(credential: ProviderCredential): void;
  get(providerId: string): ProviderCredential | undefined;
  validate(providerId: string): boolean;
  refresh(providerId: string): ProviderCredential | undefined;
  remove(providerId: string): boolean;
}

export interface IInferenceExecutor {
  execute(
    request: ModelRequest,
    adapter: IProviderAdapter,
  ): Promise<ModelResponse>;
}

export interface IProviderHealthMonitor {
  recordSuccess(providerId: string, latencyMs: number): void;
  recordFailure(providerId: string, error: string, latencyMs: number): void;
  get(providerId: string): ProviderHealthSnapshot | undefined;
  list(): readonly ProviderHealthSnapshot[];
  markRecovered(providerId: string): void;
}

export interface IUsageCollector {
  collect(record: UsageRecord): void;
  list(providerId?: string): readonly UsageRecord[];
  totals(providerId?: string): {
    readonly requests: number;
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  };
}

export interface IModelController {
  infer(dto: ModelRequestDto): Promise<ModelResponse>;
}

/** Sole public Model Service contract. */
export interface IModelService {
  infer(request: ModelRequestDto): Promise<ModelResponse>;
}

export type { IProviderAdapter };
