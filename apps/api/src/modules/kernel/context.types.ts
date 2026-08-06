/** Runtime context contracts for the AI Kernel (Phase 2.2.2). */

export interface RequestContext {
  requestId: string;
  correlationId?: string;
  path?: string;
  method?: string;
  startedAt?: string;
}

export interface UserContext {
  userId: string;
  email?: string;
  roles?: string[];
}

export interface OrganizationContext {
  organizationId: string;
  slug?: string;
  plan?: string;
}

export interface PipelineContext {
  pipelineId: string;
  stage?: string;
  runId?: string;
}

export interface WorkerContext {
  workerId: string;
  queue?: string;
  jobId?: string;
}

/** Aggregated AI OS runtime context bag. */
export interface RuntimeContext {
  request?: RequestContext;
  user?: UserContext;
  organization?: OrganizationContext;
  pipeline?: PipelineContext;
  worker?: WorkerContext;
  /** Free-form attributes for future kernel/cognitive layers. */
  attributes?: Record<string, string | number | boolean>;
}

export type ContextSection =
  | 'request'
  | 'user'
  | 'organization'
  | 'pipeline'
  | 'worker'
  | 'attributes';
