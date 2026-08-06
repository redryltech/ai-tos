/** Perception Engine domain models (Layer 3.1). Immutable typed contracts. */

export type PerceptionInputType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'website'
  | 'json'
  | 'api_request'
  | 'event';

export type PerceptionPriority = 'low' | 'normal' | 'high' | 'critical';

export type BasicEmotion =
  | 'neutral'
  | 'positive'
  | 'negative'
  | 'urgent'
  | 'uncertain'
  | 'unknown';

export interface PerceptionActor {
  readonly kind: 'user' | 'system' | 'service' | 'worker' | 'anonymous';
  readonly id?: string;
  readonly displayName?: string;
}

export interface WorldObject {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
}

export interface WorldRelationship {
  readonly id: string;
  readonly type: string;
  readonly fromObjectId: string;
  readonly toObjectId: string;
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
}

export interface WorldConstraint {
  readonly id: string;
  readonly type: string;
  readonly description: string;
  readonly severity: 'info' | 'warning' | 'blocking';
}

export interface WorldUnknown {
  readonly id: string;
  readonly field: string;
  readonly reason: string;
}

export interface SafetyObservation {
  readonly id: string;
  readonly category: string;
  readonly description: string;
  readonly severity: 'info' | 'warning' | 'high';
}

export interface PerceptionEnvironment {
  readonly channel?: string;
  readonly locale?: string;
  readonly timezone?: string;
  readonly sourceIp?: string;
  readonly userAgent?: string;
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
}

/** Canonical Perception Engine output — identical structure for every request. */
export interface WorldUnderstanding {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly actor: PerceptionActor;
  readonly goal: string;
  readonly objects: readonly WorldObject[];
  readonly relationships: readonly WorldRelationship[];
  readonly constraints: readonly WorldConstraint[];
  readonly unknowns: readonly WorldUnknown[];
  readonly environment: PerceptionEnvironment;
  readonly confidence: number;
  readonly safetyObservations: readonly SafetyObservation[];
  readonly metadata: Readonly<{
    inputType: PerceptionInputType;
    language: string;
    intent: string;
    entities: readonly string[];
    emotion: BasicEmotion;
    priority: PerceptionPriority;
    perceivedAt: string;
    schemaVersion: '1.0.0';
    extras: Readonly<Record<string, string | number | boolean | null>>;
  }>;
}

/** Normalized internal input after Input Gateway. */
export interface NormalizedPerceptionInput {
  readonly requestId: string;
  readonly userId?: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly inputType: PerceptionInputType;
  readonly content: string;
  readonly contentBinaryRef?: string;
  readonly uri?: string;
  readonly mimeType?: string;
  readonly languageHint?: string;
  readonly actor?: PerceptionActor;
  readonly environment?: Partial<PerceptionEnvironment>;
  readonly receivedAt: string;
  readonly rawMetadata: Readonly<Record<string, string | number | boolean | null>>;
}

/** Observation bag from Perception Processor (no understanding yet). */
export interface PerceptionObservations {
  readonly intent: string;
  readonly entities: readonly string[];
  readonly language: string;
  readonly emotion: BasicEmotion;
  readonly priority: PerceptionPriority;
  readonly inputType: PerceptionInputType;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

/** Understanding bag from Understanding Processor (no planning). */
export interface PerceptionUnderstanding {
  readonly relationships: readonly WorldRelationship[];
  readonly constraints: readonly WorldConstraint[];
  readonly context: Readonly<Record<string, string | number | boolean | null>>;
  readonly unknowns: readonly WorldUnknown[];
  readonly safetyObservations: readonly SafetyObservation[];
  readonly semanticMeaning: string;
  readonly objects: readonly WorldObject[];
  readonly goal: string;
  readonly confidence: number;
}
