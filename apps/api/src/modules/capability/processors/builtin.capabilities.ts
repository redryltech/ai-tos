import {
  BUILTIN_CAPABILITY_NAMES,
  type CapabilityDescriptor,
  type CapabilityImplementation,
  type CapabilityName,
} from '../models/capability.models';

const BUILTIN: readonly CapabilityName[] = BUILTIN_CAPABILITY_NAMES;

function descriptor(name: CapabilityName): CapabilityDescriptor {
  return Object.freeze({
    name,
    version: '1.0.0',
    lifecycle: 'active',
    supportedInputs: Object.freeze(['text', 'content', 'binaryRef']),
    supportedOutputs: Object.freeze(['text', 'structured']),
    latencyClass: name === 'embeddings' || name === 'classification' ? 'low' : 'medium',
    streamingSupport: name === 'text_generation' || name === 'reasoning',
    providerRequirements: Object.freeze(['capability_provider']),
    metadata: Object.freeze({ builtin: true }),
  });
}

/** Seed local capability implementations (provider-agnostic). */
export function createBuiltinLocalImplementations(
  providerId: string,
): CapabilityImplementation[] {
  return BUILTIN.map((name, index) =>
    Object.freeze({
      id: `local:${name}`,
      capability: name,
      version: '1.0.0',
      tier: 'local' as const,
      priority: 100 - index,
      available: true,
      descriptor: descriptor(name),
      providerId,
    }),
  );
}
