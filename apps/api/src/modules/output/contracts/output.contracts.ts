import type { ExecutionBlueprint } from '../../planning/models/execution-blueprint.models';
import type { BuildOutputInputDto } from '../dto/build-output-input.dto';
import type {
  CapabilityRequirements,
  ExecutionIntent,
  IntentContext,
} from '../models/execution-intent.models';

export const INTENT_CONSOLIDATOR = Symbol('INTENT_CONSOLIDATOR');
export const CAPABILITY_RESOLVER = Symbol('CAPABILITY_RESOLVER');
export const EXECUTION_CONTRACT_BUILDER = Symbol('EXECUTION_CONTRACT_BUILDER');
export const TRANSITION_VALIDATOR = Symbol('TRANSITION_VALIDATOR');
export const OUTPUT_SERVICE = Symbol('OUTPUT_SERVICE');

export interface IIntentConsolidator {
  consolidate(blueprint: ExecutionBlueprint, input: BuildOutputInputDto): IntentContext;
}

export interface ICapabilityResolver {
  resolve(context: IntentContext, input: BuildOutputInputDto): CapabilityRequirements;
}

export interface IExecutionContractBuilder {
  build(
    context: IntentContext,
    capabilities: CapabilityRequirements,
    input: BuildOutputInputDto,
  ): ExecutionIntent;
}

export interface ITransitionValidator {
  validate(intent: ExecutionIntent): ExecutionIntent;
}

/** Sole public Output Engine contract: buildOutput(executionBlueprint) → ExecutionIntent. */
export interface IOutputService {
  buildOutput(input: ExecutionBlueprint | BuildOutputInputDto): Promise<ExecutionIntent>;
}
