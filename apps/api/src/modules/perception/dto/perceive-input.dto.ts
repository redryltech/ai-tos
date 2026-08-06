import type {
  PerceptionActor,
  PerceptionEnvironment,
  PerceptionInputType,
} from '../models/world-understanding.models';

/**
 * Public perceive() input DTO — accepts every supported input type.
 * No reasoning fields; callers describe payload only.
 */
export interface PerceiveInputDto {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  /** Explicit type; inferred when omitted. */
  type?: PerceptionInputType;
  /** Primary textual / serialized payload. */
  content?: string;
  /** Reference to binary blob (image/audio/video/pdf) — not processed as model input. */
  contentBinaryRef?: string;
  /** Website / remote resource URI. */
  uri?: string;
  mimeType?: string;
  languageHint?: string;
  actor?: PerceptionActor;
  environment?: Partial<PerceptionEnvironment>;
  /** Structured JSON body when type is json | api_request | event. */
  data?: unknown;
  metadata?: Record<string, string | number | boolean | null>;
}
