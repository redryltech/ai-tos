import type { PerceiveInputDto } from '../dto/perceive-input.dto';
import type {
  NormalizedPerceptionInput,
  PerceptionObservations,
  PerceptionUnderstanding,
  WorldUnderstanding,
} from '../models/world-understanding.models';

export const INPUT_GATEWAY = Symbol('INPUT_GATEWAY');
export const PERCEPTION_PROCESSOR = Symbol('PERCEPTION_PROCESSOR');
export const UNDERSTANDING_PROCESSOR = Symbol('UNDERSTANDING_PROCESSOR');
export const WORLD_MODEL_BUILDER = Symbol('WORLD_MODEL_BUILDER');
export const OUTPUT_STANDARDIZER = Symbol('OUTPUT_STANDARDIZER');
export const PERCEPTION_SERVICE = Symbol('PERCEPTION_SERVICE');

export interface IInputGateway {
  accept(input: PerceiveInputDto): NormalizedPerceptionInput;
}

export interface IPerceptionProcessor {
  process(input: NormalizedPerceptionInput): PerceptionObservations;
}

export interface IUnderstandingProcessor {
  process(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
  ): PerceptionUnderstanding;
}

export interface IWorldModelBuilder {
  build(
    input: NormalizedPerceptionInput,
    observations: PerceptionObservations,
    understanding: PerceptionUnderstanding,
  ): WorldUnderstanding;
}

export interface IOutputStandardizer {
  standardize(candidate: WorldUnderstanding): WorldUnderstanding;
}

/** Sole public Perception Engine contract. */
export interface IPerceptionService {
  perceive(input: PerceiveInputDto): Promise<WorldUnderstanding>;
}
