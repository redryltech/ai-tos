/**
 * Ownership classification for Nest modules relative to frozen AI-TOS SA/E/F.
 *
 * This is an implementation boundary map — not a new SA/F responsibility.
 * Platform ≠ ATI Product. Cognitive-adjacent modules are retained for isolation /
 * future product rebinding; they are not Platform constitutional owners.
 */
export type OwnershipClass =
  | 'PLATFORM'
  | 'EXECUTION_RUNTIME'
  | 'SHARED_INFRA'
  | 'COGNITIVE_PRODUCT_ADJACENT'
  | 'DEVELOPER_PLATFORM';

export interface ModuleOwnership {
  readonly module: string;
  readonly ownership: OwnershipClass;
  /** Frozen SA / F anchors when Platform-owned; otherwise explanatory note. */
  readonly authority: string;
  readonly notes: string;
}

/**
 * Cognitive / product-adjacent Nest modules retained in-repo.
 * Not SA Platform Memory/Decision/World-Model ownership.
 */
export const COGNITIVE_PRODUCT_ADJACENT_MODULES = [
  'perception',
  'thinking',
  'decision',
  'planning',
  'output',
  'memory',
  'knowledge',
] as const;

export const MODULE_OWNERSHIP: readonly ModuleOwnership[] = [
  { module: 'configuration', ownership: 'SHARED_INFRA', authority: 'SA-008 / M-02', notes: 'Configuration ≠ Secrets' },
  { module: 'secrets', ownership: 'SHARED_INFRA', authority: 'SA-009 / M-06', notes: 'Secrets ≠ Configuration' },
  { module: 'logging', ownership: 'SHARED_INFRA', authority: 'SA-010 / M-12', notes: 'Observability ≠ Audit' },
  { module: 'metrics', ownership: 'SHARED_INFRA', authority: 'SA-010 / M-12', notes: 'Observability ≠ Audit' },
  { module: 'health', ownership: 'SHARED_INFRA', authority: 'SA-011 / M-13', notes: 'Continuity ≠ Decision' },
  { module: 'cache', ownership: 'SHARED_INFRA', authority: 'SA-007 engineering cache', notes: 'Cache ≠ Memory/Truth' },
  { module: 'event-bus', ownership: 'SHARED_INFRA', authority: 'SA-005 / M-08', notes: 'Event ≠ Outcome; in-process transport is local/dev default' },
  { module: 'kernel', ownership: 'SHARED_INFRA', authority: 'SA-004 / M-10', notes: 'Ephemeral runtime state; Kernel ≠ universal state owner' },
  { module: 'auth', ownership: 'PLATFORM', authority: 'SA-013 / M-03', notes: 'Identity' },
  { module: 'rbac', ownership: 'PLATFORM', authority: 'SA-013 / M-04', notes: 'Access ≠ Business Decision' },
  { module: 'organizations', ownership: 'PLATFORM', authority: 'SA-013 tenancy', notes: 'Multi-tenant membership' },
  { module: 'profiles', ownership: 'PLATFORM', authority: 'SA-013', notes: 'User profile representation' },
  { module: 'api-keys', ownership: 'PLATFORM', authority: 'SA-013', notes: 'Machine credentials' },
  { module: 'sessions', ownership: 'PLATFORM', authority: 'SA-013', notes: 'Session representation' },
  { module: 'audit-logs', ownership: 'PLATFORM', authority: 'SA-012', notes: 'Audit ≠ Observability' },
  {
    module: 'perception',
    ownership: 'COGNITIVE_PRODUCT_ADJACENT',
    authority: 'Not SA Platform ownership — product/ATI-adjacent retained',
    notes: 'WorldUnderstanding is request-scoped; Persistence ≠ World Model',
  },
  {
    module: 'thinking',
    ownership: 'COGNITIVE_PRODUCT_ADJACENT',
    authority: 'Not SA Platform ownership — product/ATI-adjacent retained',
    notes: 'Reasoning helpers; not Platform Brain',
  },
  {
    module: 'decision',
    ownership: 'COGNITIVE_PRODUCT_ADJACENT',
    authority: 'Not SA Platform ownership — product/ATI-adjacent retained',
    notes: 'Business Decision ≠ Access (RBAC); Resource allocation ≠ Decision',
  },
  {
    module: 'planning',
    ownership: 'COGNITIVE_PRODUCT_ADJACENT',
    authority: 'Not SA Platform ownership — product/ATI-adjacent retained',
    notes: 'Blueprint construction ≠ Runtime execution',
  },
  {
    module: 'output',
    ownership: 'COGNITIVE_PRODUCT_ADJACENT',
    authority: 'Not SA Platform ownership — product/ATI-adjacent retained',
    notes: 'Handoff to execution intents only',
  },
  {
    module: 'memory',
    ownership: 'COGNITIVE_PRODUCT_ADJACENT',
    authority: 'Not SA Platform ownership — product/ATI-adjacent retained',
    notes: 'Semantic Memory ≠ Persistence (SA-007); in-process store is not Truth',
  },
  {
    module: 'knowledge',
    ownership: 'COGNITIVE_PRODUCT_ADJACENT',
    authority: 'Not SA Platform ownership — product/ATI-adjacent retained',
    notes: 'Knowledge base ≠ Platform durable representation',
  },
  { module: 'capability', ownership: 'PLATFORM', authority: 'SA-003 / M-09 capability dispatch', notes: 'Runtime capability registry' },
  { module: 'model', ownership: 'PLATFORM', authority: 'SA-003 model routing', notes: 'Provider routing ≠ Decision ownership' },
  { module: 'tool', ownership: 'PLATFORM', authority: 'SA-003 tool dispatch', notes: 'Tool execution boundary' },
  { module: 'integration', ownership: 'PLATFORM', authority: 'SA-015 / M-16', notes: 'Integration ≠ Orchestration' },
  { module: 'policy', ownership: 'PLATFORM', authority: 'SA-009/SA-013 policy resolution', notes: 'Security/access policy ≠ Business Decision' },
  { module: 'workflow', ownership: 'EXECUTION_RUNTIME', authority: 'SA-003 construction', notes: 'Workflow construction ≠ Runtime execution' },
  { module: 'task-manager', ownership: 'EXECUTION_RUNTIME', authority: 'SA-003/SA-004', notes: 'Task lifecycle; not universal orchestrator' },
  { module: 'parallel-executor', ownership: 'EXECUTION_RUNTIME', authority: 'SA-004', notes: 'Enactment; Execution ≠ Runtime preserved vs workflow' },
  { module: 'reliability', ownership: 'EXECUTION_RUNTIME', authority: 'SA-011 reliability', notes: 'Reliability ≠ universal orchestration' },
  { module: 'streaming', ownership: 'EXECUTION_RUNTIME', authority: 'SA-004 streaming', notes: 'Streaming only' },
  { module: 'finalizer', ownership: 'EXECUTION_RUNTIME', authority: 'SA-003 finalization', notes: 'Finalization only' },
  { module: 'sdk', ownership: 'DEVELOPER_PLATFORM', authority: 'Developer surface', notes: 'Layer 6 — leave as-is if present' },
  { module: 'playground', ownership: 'DEVELOPER_PLATFORM', authority: 'Developer surface', notes: 'Layer 6' },
  { module: 'testing', ownership: 'DEVELOPER_PLATFORM', authority: 'Developer surface', notes: 'Layer 6' },
  { module: 'evaluation', ownership: 'DEVELOPER_PLATFORM', authority: 'Developer surface', notes: 'Layer 6' },
  { module: 'benchmark', ownership: 'DEVELOPER_PLATFORM', authority: 'Developer surface', notes: 'Layer 6' },
  { module: 'debug', ownership: 'DEVELOPER_PLATFORM', authority: 'Developer surface', notes: 'Layer 6' },
  { module: 'observability', ownership: 'DEVELOPER_PLATFORM', authority: 'SA-010 composition surface', notes: 'Must not own second telemetry pipeline' },
] as const;

export function ownershipOf(module: string): ModuleOwnership | undefined {
  return MODULE_OWNERSHIP.find((m) => m.module === module);
}
