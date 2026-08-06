import type { CapabilityRequestDto } from '../dto/capability.dto';
import type {
  CapabilityDescriptor,
  CapabilityImplementation,
  CapabilityName,
  CapabilityRequest,
  CapabilityResult,
  CapabilityTier,
} from '../models/capability.models';
import type { ICapabilityProvider } from '../providers/capability.provider';

export const CAPABILITY_PROVIDER = Symbol('CAPABILITY_PROVIDER');
export const CAPABILITY_REGISTRY = Symbol('CAPABILITY_REGISTRY');
export const CAPABILITY_RESOLVER = Symbol('CAPABILITY_RESOLVER');
export const CAPABILITY_ROUTER = Symbol('CAPABILITY_ROUTER');
export const CAPABILITY_ORCHESTRATOR = Symbol('CAPABILITY_ORCHESTRATOR');
export const CAPABILITY_CONTROLLER = Symbol('CAPABILITY_CONTROLLER');
export const CAPABILITY_SERVICE = Symbol('CAPABILITY_SERVICE');

export const MEMORY_PORT = Symbol('MEMORY_PORT');
export const KNOWLEDGE_PORT = Symbol('KNOWLEDGE_PORT');
export const MODEL_PORT = Symbol('MODEL_PORT');
export const TOOL_PORT = Symbol('TOOL_PORT');
export const INTEGRATION_PORT = Symbol('INTEGRATION_PORT');
export const POLICY_PORT = Symbol('POLICY_PORT');

export interface ICapabilityRegistry {
  register(implementation: CapabilityImplementation): void;
  unregister(implementationId: string): boolean;
  get(implementationId: string): CapabilityImplementation | undefined;
  list(capability?: CapabilityName): readonly CapabilityImplementation[];
  listDescriptors(): readonly CapabilityDescriptor[];
  setAvailable(implementationId: string, available: boolean): void;
}

export interface ICapabilityResolver {
  resolve(capability: CapabilityName): {
    readonly available: boolean;
    readonly implementations: readonly CapabilityImplementation[];
    readonly reason: string;
  };
}

export interface ICapabilityRouter {
  route(
    capability: CapabilityName,
    preferredTier?: CapabilityTier,
  ): CapabilityImplementation;
}

export interface ICapabilityOrchestrator {
  execute(request: CapabilityRequest): Promise<CapabilityResult>;
  cancel(cancelToken: string): boolean;
}

export interface ICapabilityController {
  execute(dto: CapabilityRequestDto): Promise<CapabilityResult>;
}

/** Sole public Capability Service contract. */
export interface ICapabilityService {
  execute(request: CapabilityRequestDto): Promise<CapabilityResult>;
}

export type { ICapabilityProvider };
