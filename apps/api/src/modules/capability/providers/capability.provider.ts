import type {
  CapabilityImplementation,
  CapabilityRequest,
  CapabilityResult,
} from '../models/capability.models';

/**
 * Capability Provider Interface — execute a registered capability implementation.
 * Never names OpenAI/Claude/Gemini/Ollama.
 */
export interface ICapabilityProvider {
  readonly providerId: string;
  readonly tier: 'local' | 'cloud' | 'enterprise';
  supports(implementationId: string): boolean;
  execute(
    implementation: CapabilityImplementation,
    request: CapabilityRequest,
  ): Promise<CapabilityResult>;
}
