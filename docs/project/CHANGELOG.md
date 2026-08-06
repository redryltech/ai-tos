# AI-TOS — Changelog

All notable changes to this project are documented in this file.

The format follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## [Unreleased]

### Planned
- Next roadmap phase beyond Layer 5 (await instruction)

---

## [0.37.0] — 2026-08-06

**Milestone:** Layer **5.6** Execution Finalizer (Execution Layer 5 complete).

### Added
- `FinalizerModule` / `ExecutionFinalizerService` — sole public API `finalize(completedExecution) → ExecutionResult`
- Finalization Controller · Result Collector · Result Validator · Result Composer · Execution Summary Builder · Metadata Builder · Execution Status Resolver · Execution Result Builder
- Immutable `ExecutionResult` (status · outputs · summary · metadata · traceId · completedAt)
- Final statuses: SUCCESS · PARTIAL_SUCCESS · FAILED · CANCELLED · TIMED_OUT · ROLLED_BACK
- Events: `finalization.started` · `completed` · `failed`
- Config: `FINALIZATION_*` (enabled, emit events, allow partial, require outputs, schema version)
- Processor and public API unit tests

### Changed
- Architecture docs: Execution Finalizer (Layer 5.6) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)
- Execution Layer 5 marked complete through 5.6

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.36.0] — 2026-08-06

**Milestone:** Layer **5.5** Streaming Engine.

### Added
- `StreamingModule` / `StreamingService` — sole public API `stream(executionProgress) → ExecutionStream`
- Streaming Controller · Stream Builder · Event Stream Manager · Output Stream Manager · Progress Stream Manager · Backpressure Manager · Subscription Manager · Stream Publisher
- Abstract memory transport (`IStreamTransport`) — no WebSocket/SSE/Kafka SDKs
- Immutable `ExecutionStream` (events · outputs · progress · metadata)
- Events: `stream.started` · `progress` · `completed` · `failed`
- Config: `STREAMING_*` (buffer, subscribers, backpressure watermarks, transport provider)
- Processor and public API unit tests

### Changed
- Architecture docs: Streaming Engine (Layer 5.5) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.35.0] — 2026-08-06

**Milestone:** Layer **5.4** Execution Reliability Engine.

### Added
- `ReliabilityModule` / `ExecutionReliabilityService` — sole public API `handle(executionProgress) → ExecutionRecoveryState`
- Reliability Controller · Failure Classifier · Retry Coordinator · Recovery Coordinator · Checkpoint Manager · Timeout Manager · Cancellation Manager · Circuit Breaker · Recovery State Builder
- Immutable `ExecutionRecoveryState` (status · retry · checkpoint · circuit · metadata)
- Failure classes: TRANSIENT · PERMANENT · TIMEOUT · DEPENDENCY · RESOURCE · USER · UNKNOWN
- Events: `reliability.started` · `completed` · `failed`
- Config: `RELIABILITY_*` (retries, timeouts, circuit thresholds, checkpoint provider)
- Processor and public API unit tests

### Changed
- Architecture docs: Reliability Engine (Layer 5.4) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.34.0] — 2026-08-06

**Milestone:** Layer **5.3** Parallel Executor.

### Added
- `ParallelExecutorModule` / `ParallelExecutorService` — sole public API `execute(executableTaskCollection) → ExecutionProgress`
- Execution Controller · Dependency Resolver · Concurrency Coordinator · Worker Dispatcher · Resource Coordinator · Execution Monitor · Progress Publisher
- Abstract local/stub `IWorkerAdapter` (provider-independent; no Layer 4 calls)
- Immutable `ExecutionProgress` snapshots (ephemeral monitor — no durable state)
- Events: `execution.started` · `progress` · `completed` · `failed`
- Config: `EXECUTION_*` (concurrency, CPU/memory/GPU/token budgets, rate limit, worker provider)
- Processor and public API unit tests

### Changed
- Architecture docs: Parallel Executor (Layer 5.3) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.33.0] — 2026-08-06

**Milestone:** Layer **5.2** Task Manager.

### Added
- `TaskManagerModule` / `TaskManagerService` — sole public API `createTasks(executableWorkflow) → ExecutableTaskCollection`
- Task Controller · Builder · Dependency Manager · Lifecycle Manager · Executable Task Builder · Dispatcher
- Immutable `ExecutableTask` / `ExecutableTaskCollection` with lifecycle states (CREATED → READY/WAITING; RUNNING+ deferred)
- Dispatch preparation for READY tasks only (never executes)
- Events: `task.started` · `completed` · `failed`
- Config: `TASK_*` (enabled, emit events, max tasks, allow empty)
- Processor and public API unit tests

### Changed
- Architecture docs: Task Manager (Layer 5.2) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.32.0] — 2026-08-06

**Milestone:** Layer **5.1** Workflow Engine.

### Added
- `WorkflowModule` / `WorkflowService` — sole public API `createWorkflow(executionIntent) → ExecutableWorkflow`
- Workflow Controller · Builder · Dependency Graph Builder · Validator · Execution Strategy Builder · Context Manager · Executable Workflow Builder
- Immutable `ExecutableWorkflow` (id · graph · strategy · tasks · context · metadata · traceId · version · createdAt)
- Strategies: sequential · parallel · hybrid · conditional · fan-out · fan-in (definition only)
- Events: `workflow.started` · `completed` · `failed`
- Config: `WORKFLOW_*` (enabled, emit events, max nodes, allow empty, default strategy)
- Processor and public API unit tests

### Changed
- Architecture docs: Workflow Engine (Layer 5.1) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.31.0] — 2026-08-05

**Milestone:** Layer **4.7** Policy Service (AI Services Layer 4 complete).

### Added
- `PolicyModule` / `PolicyService` — sole public API `resolve(request) → EffectivePolicy`
- Policy Controller · Registry · Composer · Resolver · Conflict Resolver · Effective Policy Builder · `IPolicyProvider`
- Hierarchical composition (global → organization → department → project → application → user → session)
- Conflict strategies: most restrictive · highest authority (explicit override)
- Default in-memory provider; storage-independent interface
- Events: `policy.resolution.started` · `completed` · `failed` · `registered` · `updated` · `version.created`
- Config: `POLICY_*` (provider, conflict strategy, version retention, registration)
- Registry, composer, resolver, conflict, builder, provider, contract, and public API tests

### Changed
- Architecture docs: Policy Service (Layer 4.7) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)
- Layer 4 AI Services marked complete through 4.7

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.30.0] — 2026-08-05

**Milestone:** Layer **4.6** Integration Service.

### Added
- `IntegrationModule` / `IntegrationService` — sole public API `execute(request) → IntegrationResult`
- Integration Controller · Registry · Resolver · Connection Lifecycle Manager · `IConnectorAdapter`
- Stub connectors for enterprise systems (GitHub · Slack · Salesforce · SAP · cloud · DBs · messaging · REST/GraphQL/SOAP · MCP) — no vendor SDKs
- Auth lifecycle: API key · OAuth/OAuth2 · JWT · Managed Identity · Certificates · Basic · refresh · pool · recover
- Events: `integration.started` · `completed` · `failed` · `connector.registered` · `connected` · `disconnected` · `authentication.failed` · `recovered`
- Config: `INTEGRATION_*` (timeouts, pool, health interval, auth mode, registration)
- Registry, resolver, lifecycle, authentication, adapter, contract, and public API tests

### Changed
- Architecture docs: Integration Service (Layer 4.6) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.29.0] — 2026-08-05

**Milestone:** Layer **4.5** Tool Service.

### Added
- `ToolModule` / `ToolService` — sole public API `execute(request) → ToolResult`
- Tool Controller · Registry · Resolver · Executor · `IToolAdapter`
- Deterministic builtin adapters (filesystem · shell stub · runtimes · HTTP/SQL stubs · calculator · JSON/CSV/XML · compression/encoding · PDF/archive/image · browser stub)
- Sync / stream / async modes · timeout · cancellation
- Events: `tool.started` · `completed` · `failed` · `cancelled` · `registered`
- Config: `TOOL_*` (timeouts, concurrency, streaming, registration, shell policy)
- Registry, resolver, executor, adapter, timeout, cancellation, contract, and public API tests

### Changed
- Architecture docs: Tool Service (Layer 4.5) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.28.0] — 2026-08-05

**Milestone:** Layer **4.4** Model Service.

### Added
- `ModelModule` / `ModelService` — sole public API `infer(request) → ModelResponse`
- Model Controller · Provider Registry · Authentication Manager · Inference Executor · Health Monitor · Usage Collector
- Provider Adapter interface with stub adapters (OpenAI · Claude · Gemini · Azure · Bedrock · Ollama · vLLM · Local) — no vendor SDKs
- Sync / stream / batch / async inference modes at the executor boundary
- Events: `model.inference.started` · `completed` · `failed` · `provider.registered` · `unhealthy` · `recovered`
- Config: `MODEL_*` (timeouts, streaming, health interval, default provider, auth mode)
- Registry, authentication, adapter, executor, health, usage, contract, and public API tests

### Changed
- Architecture docs: Model Service (Layer 4.4) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm --filter @ai-tos/api build` ✅ · typecheck ✅ · lint ✅ · test ✅

---

## [0.27.0] — 2026-08-05

**Milestone:** Layer **4.3** Capability Service.

### Added
- `CapabilityModule` / `CapabilityService` — sole public API `execute(request) → CapabilityResult`
- Capability Controller · Registry · Resolver · Router · Orchestrator · `ICapabilityProvider`
- Dynamic capability registration with builtin provider-agnostic local implementations
- Sequential / parallel pipelines · fallback · timeout · cancellation
- Abstract ports: Memory · Knowledge · Model · Tool · Integration · Policy (noop consumers only)
- Events: `capability.started` · `completed` · `failed` · `cancelled`
- Config: `CAPABILITY_*` (routing, timeouts, fallback, parallelism)
- Registry, resolver, router, orchestrator, pipeline, fallback, parallel, contract, and public API tests

### Changed
- Architecture docs: Capability Service (Layer 4.3) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.26.0] — 2026-08-05

**Milestone:** Layer **4.2** Knowledge Service.

### Added
- `KnowledgeModule` / `KnowledgeService` — `ingest` / `retrieve` / `search` / `update` / `delete` / `list`
- Document Loader · Parser · Index Manager · Knowledge Store · Retrieval Engine
- Storage-independent `IKnowledgeProvider` with default in-memory provider
- `IEmbeddingCapabilityPort` no-op abstraction (Capability Service not implemented)
- Events: `knowledge.ingested` · `updated` · `deleted` · `retrieved` · `search.completed` · `failed`
- Config: `KNOWLEDGE_*` (provider, chunking, top-K, search mode)
- Unit, loader, parser, index, retrieval, provider, contract, and public API tests

### Changed
- Architecture docs: Knowledge Service (Layer 4.2) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.25.0] — 2026-08-05

**Milestone:** Layer **4.1** Memory Service.

### Added
- `MemoryModule` / `MemoryService` — `remember` / `recall` / `update` / `forget` / `archive` / `search`
- Memory Controller · Memory Evaluator · Session / Long-term / Episodic stores
- Storage-independent `IMemoryProvider` with default in-memory provider
- Events: `memory.remembered` · `updated` · `archived` · `forgotten` · `failed`
- Config: `MEMORY_ENABLED`, `MEMORY_EMIT_EVENTS`, `MEMORY_PROVIDER`, `MEMORY_MAX_ENTRIES`, TTL and archive settings
- Unit, lifecycle, store, provider, contract, and public API tests

### Changed
- Architecture docs: Memory Service (Layer 4.1) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.24.0] — 2026-08-04

**Milestone:** Layer **3.5** Output Engine — **AI Brain Cognitive Layer (Layer 3) COMPLETE**.

### Added
- `OutputModule` / `OutputService` — public API `buildOutput(executionBlueprint) → ExecutionIntent`
- Pipeline: Intent Consolidator · Capability Resolver · Execution Contract Builder · Transition Validator
- Immutable `ExecutionIntent` contract + DTOs + DI tokens
- Events: `output.started` · `output.completed` · `output.failed`
- Config: `OUTPUT_ENABLED`, `OUTPUT_EMIT_EVENTS`, `OUTPUT_DEFAULT_PRIORITY`
- Unit, processor, contract, public API, pipeline, and ExecutionIntent validation tests

### Changed
- Architecture docs: Output Engine (Layer 3.5) and Cognitive Layer completion in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.23.0] — 2026-08-04

**Milestone:** Layer **3.4** Planning Engine.

### Added
- `PlanningModule` / `PlanningService` — public API `plan(decision) → ExecutionBlueprint`
- Pipeline: Strategy Designer · Task Decomposer · Dependency Designer · Execution Blueprint Builder
- Immutable `ExecutionBlueprint` contract + DTOs + DI tokens
- Events: `planning.started` · `planning.completed` · `planning.failed`
- Config: `PLANNING_ENABLED`, `PLANNING_EMIT_EVENTS`, `PLANNING_MAX_TASKS`
- Unit, processor, contract, public API, pipeline, and blueprint validation tests

### Changed
- Architecture docs: Planning Engine (Layer 3.4) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.22.0] — 2026-08-04

**Milestone:** Layer **3.3** Decision Engine.

### Added
- `DecisionModule` / `DecisionService` — public API `decide(thought) → Decision`
- Pipeline: Evidence Validator · Constraint Validator · Judgment Core · Commitment Manager
- Immutable `Decision` contract + DTOs + DI tokens
- Events: `decision.started` · `decision.completed` · `decision.failed`
- Config: `DECISION_ENABLED`, `DECISION_EMIT_EVENTS`, `DECISION_MIN_CONFIDENCE`, `DECISION_APPROVAL_CONFIDENCE_THRESHOLD`
- Unit, processor, contract, public API, pipeline, and judgment validation tests

### Changed
- Architecture docs: Decision Engine (Layer 3.3) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.21.0] — 2026-08-04

**Milestone:** Layer **3.2** Thinking Engine.

### Added
- `ThinkingModule` / `ThinkingService` — public API `think(worldUnderstanding) → Thought`
- Pipeline: Context Builder · Knowledge Synthesizer · Reasoning Core · Critical Evaluator · Thought Composer
- Immutable `Thought` contract + DTOs + DI tokens
- Events: `thinking.started` · `thinking.completed` · `thinking.failed`
- Config: `THINKING_ENABLED`, `THINKING_EMIT_EVENTS`, `THINKING_MAX_CANDIDATES`
- Unit, processor, contract, public API, pipeline, and reasoning validation tests

### Changed
- Architecture docs: Thinking Engine (Layer 3.2) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.20.0] — 2026-08-04

**Milestone:** Layer **3.1** Perception Engine.

### Added
- `PerceptionModule` / `PerceptionService` — public API `perceive(input) → WorldUnderstanding`
- Pipeline: Input Gateway · Perception Processor · Understanding Processor · World Model Builder · Output Standardizer
- Immutable `WorldUnderstanding` contract + DTOs + DI tokens
- Events: `perception.started` · `perception.completed` · `perception.failed`
- Config: `PERCEPTION_ENABLED`, `PERCEPTION_EMIT_EVENTS`, `PERCEPTION_DEFAULT_LANGUAGE`
- Unit, processor, contract, public API, pipeline, and validation tests

### Changed
- Architecture docs: Perception Engine (Layer 3.1) in [`AI_BRAIN_ARCHITECTURE.md`](../AI_BRAIN_ARCHITECTURE.md) and [`architecture.md`](../architecture.md)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅

---

## [0.19.5] — 2026-08-04

**Milestone:** Phase **2.2.6** AI Kernel Communication Manager.

### Added
- `CommunicationManagerService` in `KernelModule`
- Service and worker endpoint messaging
- Point-to-point and broadcast delivery
- Request/response routing with correlation ids and timeouts
- Event Bus topics `kernel.comm.*`
- Config: `KERNEL_COMM_ENABLED`, `KERNEL_COMM_EMIT_EVENTS`, `KERNEL_COMM_REQUEST_TIMEOUT_MS`, `KERNEL_COMM_MAX_PENDING_REQUESTS`
- Unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.19.4] — 2026-08-04

**Milestone:** Phase **2.2.5** AI Kernel Lifecycle Manager.

### Added
- `LifecycleManagerService` in `KernelModule`
- Task/execution lifecycle: start, pause, resume, stop, cancel, complete
- Validated phase transitions with history
- Event Bus topics `kernel.lifecycle.*` (registered, start, pause, resume, stop, cancel, complete)
- Config: `KERNEL_LIFECYCLE_ENABLED`, `KERNEL_LIFECYCLE_EMIT_EVENTS`, `KERNEL_LIFECYCLE_MAX_ENTRIES`
- Unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.19.3] — 2026-08-04

**Milestone:** Phase **2.2.4** AI Kernel Resource Manager.

### Added
- `ResourceManagerService` in `KernelModule`
- Worker and AI model allocation helpers
- Memory and concurrency limits with capacity checks
- Resource reservation / release / tryReserve (optional TTL)
- Event Bus topics `kernel.resource.reserved` / `kernel.resource.released`
- Config: `KERNEL_RESOURCE_ENABLED`, `KERNEL_RESOURCE_EMIT_EVENTS`, `KERNEL_RESOURCE_MAX_*`
- Unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.19.2] — 2026-08-04

**Milestone:** Phase **2.2.3** AI Kernel State Manager.

### Added
- `StateManagerService` in `KernelModule`
- Execution state tracking with validated transitions
- States: pending, scheduled, running, waiting, completed, failed, cancelled
- Event Bus topics `kernel.state.created` / `kernel.state.transitioned` / `kernel.state.removed`
- Config: `KERNEL_STATE_ENABLED`, `KERNEL_STATE_EMIT_EVENTS`, `KERNEL_STATE_MAX_ENTRIES`
- Unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.19.1] — 2026-08-04

**Milestone:** Phase **2.2.2** AI Kernel Context Manager.

### Added
- `ContextManagerService` in `KernelModule`
- Request, user, organization, pipeline, and worker context sections
- AsyncLocalStorage propagation (`runWithContext`, `fork`, `setContext`)
- Event Bus topics `kernel.context.bound` / `kernel.context.updated`
- Config: `KERNEL_CONTEXT_ENABLED`, `KERNEL_CONTEXT_EMIT_EVENTS`
- Unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.19.0] — 2026-08-04

**Milestone:** Phase **2.2.1** AI Kernel Task Scheduler.

### Added
- `KernelModule` / injectable `TaskSchedulerService`
- Task creation with unique IDs and states (pending/scheduled/running/completed/failed/cancelled)
- FIFO + priority queue, delayed tasks, retry scheduling, timeout handling, cancellation
- Event Bus lifecycle topics (`kernel.task.*`) and ConfigService kernel scheduler settings
- Unit tests for priority queue and scheduler

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.18.6] — 2026-08-04

**Milestone:** Phase **2.1.7** Event Bus · **AI OS Layer 1 complete**.

### Added
- `EventBusModule` / injectable `EventBusService`
- Publish, subscribe, unsubscribe, async dispatch, typed `AiOsEvent`
- Topic routing (`*` / `#` wildcards) for Kernel / Cognitive / AI / Execution / Workers
- In-memory transport with `EventBusTransport` abstraction (future Kafka/Redis via `EVENT_BUS_URL`)
- Config via `ConfigService`: `EVENT_BUS_ENABLED`, `EVENT_BUS_DRIVER`, `EVENT_BUS_MAX_LISTENERS`, `EVENT_BUS_DISPATCH`
- Unit tests for routing and EventBusService

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.18.5] — 2026-08-04

**Milestone:** Phase **2.1.6** Cache Service.

### Added
- `CacheModule` / injectable `CacheService`
- Generic `CacheStore` with memory and Redis backends
- TTL, namespaces, invalidation, hit/miss statistics, `getOrSet`
- Config via `ConfigService`: `CACHE_DRIVER`, `CACHE_TTL_SECONDS`, `CACHE_NAMESPACE`, `CACHE_MAX_MEMORY_ENTRIES`, `REDIS_CACHE_URL`
- Unit tests for memory store and CacheService

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.18.4] — 2026-08-04

**Milestone:** Phase **2.1.5** Health Service.

### Added
- Enterprise `HealthModule` / `HealthService` with dependency probes
- Endpoints: `/health`, `/ready`, `/live` (Kubernetes readiness/liveness; excluded from API prefix)
- Monitors: API, Database, Redis, Cache, AI Gateway, Event Bus
- Config via `ConfigService` health section (`HEALTH_*`, `REDIS_CACHE_URL`, `EVENT_BUS_URL`)
- Unit tests for aggregation and HealthService

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.18.3] — 2026-08-04

**Milestone:** Phase **2.1.4** Metrics Service.

### Added
- `MetricsModule` / injectable `MetricsService`
- Counters/histograms/gauges: requests, durations (HTTP/AI/worker/pipeline), cache hit/miss, errors, CPU, memory
- Prometheus text exposition (`renderPrometheus`)
- Config via `ConfigService`: `METRICS_ENABLED`, `METRICS_PREFIX`
- Unit tests for registry + MetricsService

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.18.2] — 2026-08-04

**Milestone:** Phase **2.1.3** Logging Service.

### Added
- `LoggingModule` / injectable `LoggerService`
- Structured JSON logs with timestamp, requestId, correlationId, aiRequestId, organizationId, userId, workerId
- Log levels: debug, info, warn, error (via `ConfigService` / `LOG_LEVEL`)
- Configurable transports: console + file (`LOG_TRANSPORTS`, `LOG_FILE_PATH`)
- Deep redaction of secrets, tokens, passwords, API keys
- AsyncLocalStorage context binding for concurrent request safety
- Unit tests for redaction and LoggerService

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.18.1] — 2026-08-04

**Milestone:** Phase **2.1.2** Secrets Service.

### Added
- `SecretsModule` / `SecretsService` with DI
- Secret provider abstraction (`EnvSecretProvider`, `MemorySecretProvider`)
- Secure retrieval for JWT, encryption, platform API keys, AI provider secrets
- Runtime rotation overlay + in-memory TTL cache
- `SecretValue` redaction (no plaintext in logs/JSON/inspect)
- Unit tests for redaction, memory store, and SecretsService

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.18.0] — 2026-08-04

**Milestone:** Phase **2.1.1** Configuration Service.

### Added
- Structured `PlatformConfig` sections: app, api, database, redis, ai, security, monitoring
- Deploy environments: development, testing, staging, production (`APP_ENV`)
- Nest `ConfigurationModule` + injectable `ConfigService`
- Staging/production fail-fast for insecure/missing secrets and required URLs
- Unit tests (`@ai-tos/config`, ConfigService)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.17.1] — 2026-08-03

**Milestone:** Phase 1 stabilization (pre–Phase 2).

### Security
- Production startup fails if `JWT_SECRET`, `JWT_REFRESH_SECRET`, or `API_KEY_ENCRYPTION_SECRET` use insecure defaults/placeholders (dev/test unchanged)

### Changed
- Organization privileged APIs authorize via RBAC permissions only (`organization:update` / `organization:delete` / `users:manage`)
- Documented authz SoT: `organization_members` = membership; `organization_user_roles` = authorization

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · unit tests ✅

---

## [0.17.0] — 2026-08-03

**Milestone:** Phase **1.7** Audit Logs — **Identity Platform (Phase 1) COMPLETE**.

### Added
- Migration `009_audit_logs.sql` (+ `audit_logs` RBAC permissions)
- `AuditLogsModule` — filtered/paginated list API
- Audit write hooks: login/logout/refresh, org CRUD/invite, role assign/revoke, profile update, API key lifecycle, session revoke
- RBAC: Owner/Admin full org logs; Manager team-scoped; Analyst/Viewer denied
- Unit tests (audit utils)

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.16.0] — 2026-08-03

**Milestone:** Phase **1.6** Session Management.

### Added
- Migration `008_user_sessions.sql`
- `SessionsModule` — list active, revoke current/specific, revoke others
- Auth integration: create on login, rotate on refresh, revoke on logout
- Optional `x-organization-id` stored on session
- Self-only ownership; refresh token material never exposed
- Session util unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.15.0] — 2026-08-03

**Milestone:** Phase **1.5** Secure API Key Management.

### Added
- Migration `007_api_keys.sql` (org-scoped encrypted keys)
- `ApiKeysModule` — create/list/get/update/revoke/delete
- AES-256-GCM encryption via `API_KEY_ENCRYPTION_SECRET`
- Providers: OpenAI, Gemini, Claude, market data, broker, email, Telegram, webhook, custom
- RBAC: Owner/Admin only (`@Roles` + `api_keys:manage`)
- Public responses expose `keyLast4` only; `decryptForInternalUse` for services
- Crypto / mapper unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.14.0] — 2026-08-03

**Milestone:** Phase **1.4** User Profiles.

### Added
- Migration `006_user_profiles.sql`
- `ProfilesModule` — self-only CRUD at `/api/profiles/me`
- Fields: full name, avatar URL, phone, timezone, language, theme, notification preferences
- Optional `x-organization-id` header compatibility (profile remains user-owned)
- Shared `UserProfile` / theme / notification preference types
- Profile util unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.13.0] — 2026-08-03

**Milestone:** Phase **1.3** RBAC (org-scoped roles & permissions).

### Added
- Migrations `004_rbac.sql` · `005_rbac_seed.sql` (roles, permissions, mappings, org assignments)
- Frozen roles: Owner, Admin, Manager, Analyst, Viewer
- `RbacModule` — list roles/permissions, assign/revoke org roles
- `@Roles()` · `RolesGuard` · `@RequirePermissions()` · `PermissionGuard`
- Shared `RbacRoleKey` / resource / action types
- Policy unit tests (`manage` implies CRUD; assignment rank rules)
- Org create/accept-invite grants default RBAC roles

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.12.0] — 2026-08-03

**Milestone:** Phase **1.2** Organization Management (multi-tenancy).

### Added
- Migration `003_organizations.sql` (organizations, members, invites)
- `OrganizationsModule` — CRUD, members list, invite + accept
- Org membership roles: `owner` / `admin` / `member`
- Shared `Organization` / `OrgMemberRole` types
- Slug helpers + unit tests

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.11.0] — 2026-07-31

**Milestone:** Phase **1.1** Authentication Foundation.

### Added
- JWT access + refresh token architecture with rotation and hashed refresh storage
- Argon2id password hashing (`PasswordService`)
- `POST /api/auth/login`, `/refresh`, `/logout`
- Global `JwtAuthGuard` + `@Public()`; cookie or Bearer extraction
- Secure httpOnly auth cookies; throttler on auth routes
- Global HTTP exception filter (envelope errors)
- Migration `002_auth_foundation.sql` (`password_hash`, `refresh_tokens`)
- Auth config keys in `@ai-tos/config`; shared `AuthUser` / token payload updates
- Unit tests for password hashing and cookie helpers

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.10.0] — 2026-07-31

**Milestone:** Final production readiness — Foundation Phase 0B complete.

### Added
- `docs/project/PRODUCTION_READINESS.md` — final checklist
- `docs/project/VALIDATION_REPORT.md` — gate verdict PASS

### Changed
- Marked Phase 0B.10 and Foundation (Phase 0B) complete; NEXT_TASK → Phase 1

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.9.0] — 2026-07-31

**Milestone:** Platform Operations & Disaster Recovery (Phase **0B.9**).

### Added
- `scripts/backup-validate.sh` — scheduled backup checks (RDS/Redis/S3)
- `scripts/dr-verify.sh` — DR retention/CRR verification + restore dry-run
- `scripts/platform-maintain.sh` — maintenance helpers
- `.github/workflows/platform-ops.yml` — weekly staging ops automation
- `docs/runbooks/platform-operations.md`
- `docs/runbooks/production-operations.md`

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.8.0] — 2026-07-31

**Milestone:** Resilience, DR & Runbooks (Phase **0B.8**).

### Added
- `docs/runbooks/rpo-rto.md` — RDS/Redis/MSK/state CRR targets + procedures
- `docs/runbooks/multi-az-failure-drill.md` — staging AZ/RDS/MSK drills
- `docs/runbooks/backup-restore.md` — restore verification cadence
- `docs/runbooks/on-call-alerting.md` — severity taxonomy + routing
- `docs/runbooks/phase-0-exit-criteria.md` — Phase 0 sign-off checklist

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅

---

## [0.7.0] — 2026-07-31

**Milestone:** CI/CD Production Gates (Phase **0B.7**).

### Added
- OIDC Terraform plan/apply gated by GitHub Environments (`staging`, `production`)
- Blocking security gates: CodeQL, dependency audit, tfsec, Trivy config/image
- Syft CycloneDX SBOM artifacts; Cosign keyless sign + attest on release images
- `deploy-smoke.yml` + `scripts/smoke.sh` post-deploy health checks
- `.github/environments.md` protection-rules / variables checklist

### Validation
- `pnpm build` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ · `bash -n scripts/smoke.sh` ✅

---

## [0.6.0] — 2026-07-31

**Milestone:** Observability Platform (Phase **0B.6**).

### Summary
Delivers the AI-TOS observability stack: OpenTelemetry Collector, Prometheus, Grafana, Loki, Tempo, Alertmanager, AMP/IRSA Terraform, Helm OTEL wiring, and local Compose observability services.

### Added
- Kubernetes observability manifests (`infrastructure/kubernetes/observability/`)
  - OpenTelemetry Collector (DaemonSet agent + Gateway)
  - Prometheus + platform alert rules + Alertmanager
  - Loki (structured logs) + Tempo (traces)
  - Grafana datasources + platform-health dashboard-as-code
  - Optional Prometheus Operator ServiceMonitor/PodMonitor patterns
- Terraform module + environment: Amazon Managed Prometheus + IRSA for Prometheus, OTel Collector, Grafana
- Helm: OTEL env baseline, per-service `OTEL_SERVICE_NAME`, optional ServiceMonitor template
- `@ai-tos/config`: optional OTEL environment schema defaults
- Docker Compose: otel-collector, prometheus, loki, tempo, grafana (port 3001)

### Validation
- `pnpm build` ✅
- `pnpm typecheck` ✅
- `pnpm lint` ✅
- `terraform validate` ✅
- `helm template` ✅

---

## [0.5.0] — 2026-07-31

**Milestone:** Platform Foundation complete through Phase **0B.5**.

### Summary
Delivers the production-grade AI-TOS engineering foundation and cloud platform scaffold from Phase **0A** through **0B.5**. No trading, market analysis, or AI decision business logic is included.

### Added — Phase 0A (Engineering Foundation)
- pnpm workspace + TurboRepo monorepo tooling
- Shared packages: `shared`, `config`, `ui`, `sdk`, `database`
- Application scaffolds: Next.js web, NestJS API, FastAPI AI service, Go workers/scheduler
- Local developer experience: Docker Compose, Make/Taskfile, Dev Container hooks
- Helm chart + Kustomize overlays; legacy raw Kubernetes YAML isolated
- GitHub Actions CI baseline (lint, typecheck, build, test)
- Architecture Review Board ADRs **0001–0012** (monorepo, events, Redis split, RDS, Helm/GitOps, TF state, secrets, observability architecture, CI/CD, testing)
- Health and contract testing strategy baseline

### Added — Phase 0B.1 (AWS Cloud Foundation)
- Multi-account AWS Organizations baseline
- Multi-AZ 3-tier VPC networking (primary/DR region strategy)
- IAM/OIDC roles, KMS CMKs, S3 artifact/log/backup buckets
- Security baseline: CloudTrail, Config, GuardDuty, Security Hub
- Cost allocation tags and budgets
- ADR-0013

### Added — Phase 0B.2 (EKS Kubernetes Platform)
- EKS cluster foundation (private endpoint, managed node groups)
- IRSA, Cluster Autoscaler, Metrics Server, AWS Load Balancer Controller
- Namespaces, Pod Security Standards, network policies, RBAC, storage classes
- ADR-0014

### Added — Phase 0B.3 (Data Platform)
- Amazon RDS for PostgreSQL 16 (Multi-AZ, PITR, KMS, Secrets Manager)
- Split ElastiCache Redis: `redis-cache` (volatile) + `redis-state` (durable)
- ADR-0015

### Added — Phase 0B.4 (Event Platform)
- Amazon MSK (Kafka 3.6, Multi-AZ, IAM + SCRAM, TLS, KMS)
- Topic / DLQ / retry surface as code
- Glue Schema Registry (Avro) strategy
- ADR-0016

### Added — Phase 0B.5 (Secrets & Delivery Platform)
- Secrets Manager + KMS + External Secrets Operator delivery patterns
- Helm + Kustomize environment overlays ready for GitOps (Argo CD)
- Service identity / IRSA binding readiness for platform workloads
- Foundation completion gate (`v0.5.0`)

### Security
- No long-lived cloud credentials in git
- Secrets via AWS Secrets Manager / ESO patterns (no static production secrets in manifests)
- OIDC-oriented CI authentication design (ADR-0011)

### Documentation
- Architecture, technology matrix, readiness report, diagrams, onboarding, and ADR index

---

## Version Map

| Version | Phase gate | Notes |
|---|---|---|
| `v0.5.0` | Through **0B.5** | Foundation baseline |
| `v0.6.0` | Through **0B.6** | Observability Platform |
| `v0.7.0` | Through **0B.7** | CI/CD Production Gates |
| `v0.8.0` | Through **0B.8** | Resilience, DR & Runbooks |
| `v0.9.0` | Through **0B.9** | Platform Operations & DR |
| `v0.10.0` | Through **0B.10** | Foundation complete |
| `v1.0.0` | Phase **8** GA | Production release target |

---

## Links

- Roadmap: [`ROADMAP.md`](./ROADMAP.md)
- Status: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
- Next task: [`NEXT_TASK.md`](./NEXT_TASK.md)
