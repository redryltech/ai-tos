# Architecture Overview

AI-TOS Phase 0 is a modular, cloud-native monorepo. No trading or AI decision logic is
implemented; this is the production-grade foundation. This document reflects the
**post-Review-Board** decisions (ADRs 0004–0012).

## Layers

- **Web** (`apps/web`, Next.js): dashboard shell, auth UI, theming, React Query.
- **API** (`apps/api`, NestJS): REST + (future) WS, Swagger, RBAC, audit interceptor, `/health`.
- **AI Kernel (Layer 2)** (`apps/api` → `KernelModule`): in-process control plane —
  Task Scheduler, Context, State, Resource, Lifecycle, Communication managers.
  **Ownership:** [`docs/ai-kernel-ownership.md`](./ai-kernel-ownership.md).
- **Perception Engine (Layer 3.1)** (`apps/api` → `PerceptionModule`):
  `perceive(input) → WorldUnderstanding` — Input Gateway → processors → World Model → Output Standardizer.
  Never thinks / plans / executes / calls providers or workers.
- **Thinking Engine (Layer 3.2)** (`apps/api` → `ThinkingModule`):
  `think(worldUnderstanding) → Thought` — Context Builder → Knowledge Synthesizer → Reasoning Core → Critical Evaluator → Thought Composer.
  Never decides / plans execution / executes / allocates / schedules / calls workers or providers.
- **Decision Engine (Layer 3.3)** (`apps/api` → `DecisionModule`):
  `decide(thought) → Decision` — Evidence Validator → Constraint Validator → Judgment Core → Commitment Manager.
  Never reasons / plans strategies / executes / allocates / schedules / calls workers or providers.
- **Planning Engine (Layer 3.4)** (`apps/api` → `PlanningModule`):
  `plan(decision) → ExecutionBlueprint` — Strategy Designer → Task Decomposer → Dependency Designer → Execution Blueprint Builder.
  Never executes / schedules / allocates / decides / reasons / calls workers or providers.
- **Output Engine (Layer 3.5)** (`apps/api` → `OutputModule`):
  `buildOutput(executionBlueprint) → ExecutionIntent` — Intent Consolidator → Capability Resolver → Execution Contract Builder → Transition Validator.
  Never executes / decides / reasons / plans / schedules / allocates / calls workers or providers.
- **AI Brain Cognitive Layer (Layer 3)** — ✅ COMPLETE (`perceive` → `think` → `decide` → `plan` → `buildOutput`).
- **Memory Service (Layer 4.1)** (`apps/api` → `MemoryModule`):
  `remember` / `recall` / `update` / `forget` / `archive` / `search` — Session · Long-term · Episodic via `IMemoryProvider`.
  Never thinks / reasons / decides / plans / executes / calls models / does RAG.
- **Knowledge Service (Layer 4.2)** (`apps/api` → `KnowledgeModule`):
  `ingest` / `retrieve` / `search` / `update` / `delete` / `list` — Loader · Parser · Index · Store · Retrieval via `IKnowledgeProvider`.
  Never thinks / reasons / embeds / stores experiences / calls model providers.
- **Capability Service (Layer 4.3)** (`apps/api` → `CapabilityModule`):
  `execute(request) → CapabilityResult` — Controller · Registry · Resolver · Router · Orchestrator · `ICapabilityProvider`.
  Never thinks / reasons / plans / calls AI vendors / authenticates providers / stores memory or knowledge.
- **Model Service (Layer 4.4)** (`apps/api` → `ModelModule`):
  `infer(request) → ModelResponse` — Controller · Registry · Auth · Adapter · Executor · Health · Usage.
  Never thinks / reasons / selects capabilities / stores memory or knowledge / calls Capability Service.
- **Tool Service (Layer 4.5)** (`apps/api` → `ToolModule`):
  `execute(request) → ToolResult` — Controller · Registry · Resolver · Executor · `IToolAdapter`.
  Never thinks / reasons / runs AI inference / connects to enterprise SaaS.
- **Integration Service (Layer 4.6)** (`apps/api` → `IntegrationModule`):
  `execute(request) → IntegrationResult` — Controller · Registry · Resolver · Lifecycle · `IConnectorAdapter`.
  Never thinks / reasons / runs AI inference / performs deterministic tool computation.
- **Policy Service (Layer 4.7)** (`apps/api` → `PolicyModule`):
  `resolve(request) → EffectivePolicy` — Controller · Registry · Composer · Resolver · Conflict · Builder · `IPolicyProvider`.
  Never enforces / reasons / executes / authenticates / authorizes.
- **Workflow Engine (Layer 5.1)** (`apps/api` → `WorkflowModule`):
  `createWorkflow(executionIntent) → ExecutableWorkflow` — Controller · Builder · Graph · Validator · Strategy · Context · Executable Builder.
  Compile-time only — never executes / retries / streams / schedules / manages runtime state.
- **Task Manager (Layer 5.2)** (`apps/api` → `TaskManagerModule`):
  `createTasks(executableWorkflow) → ExecutableTaskCollection` — Controller · Builder · Dependency · Lifecycle · Executable Builder · Dispatcher.
  Lifecycle until dispatch prep — never executes / retries / recovers / streams / finalizes.
- **Parallel Executor (Layer 5.3)** (`apps/api` → `ParallelExecutorModule`):
  `execute(executableTaskCollection) → ExecutionProgress` — Controller · Dependency Resolver · Concurrency · Worker Dispatcher · Resource · Monitor · Progress.
  Executes via abstract workers — never retries / recovers / streams / finalizes / calls Layer 4.
- **Execution Reliability Engine (Layer 5.4)** (`apps/api` → `ReliabilityModule`):
  `handle(executionProgress) → ExecutionRecoveryState` — Classifier · Retry · Recovery · Checkpoint · Timeout · Cancellation · Circuit Breaker · State Builder.
  Reliability only — never executes / streams / finalizes / calls Layer 4.
- **Streaming Engine (Layer 5.5)** (`apps/api` → `StreamingModule`):
  `stream(executionProgress) → ExecutionStream` — Builder · Event/Output/Progress · Backpressure · Subscription · Publisher.
  Transport-independent streaming — never executes / retries / recovers / finalizes / binds transport SDKs.
- **Execution Finalizer (Layer 5.6)** (`apps/api` → `FinalizerModule`):
  `finalize(completedExecution) → ExecutionResult` — Collector · Validator · Composer · Summary · Metadata · Status Resolver · Result Builder.
  Finalization only — never executes / retries / streams / manages workflows or task lifecycle.
- **AI Brain (AI OS):** Cognitive · AI Services · Execution · Kernel · Workers —
  full developer architecture: [`docs/AI_BRAIN_ARCHITECTURE.md`](./AI_BRAIN_ARCHITECTURE.md).
  Layer 4 complete; **Execution Layer 5 (5.1–5.6) COMPLETE.**
- **AI Service** (`apps/ai-service`, Python/FastAPI): LLM provider interfaces (OpenAI/Gemini/Claude). No logic.
- **Workers** (`apps/{market,risk,news,scheduler}`, Go): health + event-consumer skeletons.
- **Packages** (`packages/*`): `shared` (types/zod), `config` (env schema), `ui` (components), `sdk` (typed client), `database` (pg pool + migrations).

## Cross-cutting (post-Review-Board)

- **Monorepo**: pnpm + Turbo. `apps/*` deployable, `packages/*` shared.
- **Config**: validated via `@ai-tos/config` (Zod). Fail-fast on invalid env.
- **Event backbone (ADR-0004)**: **Apache Kafka (MSK)** — durable, ordered, replayable.
  Schema Registry + Transactional Outbox + idempotent consumers + DLQ. Redis no longer carries the bus.
- **Redis (ADR-0005)**: split into `redis-cache` (volatile) and `redis-state` (sessions + rate
  limiting); the "stream" role is retired in favor of Kafka.
- **Database (ADR-0006)**: **Amazon RDS for PostgreSQL 16** as primary OLTP; Aurora rejected as
  default; TimescaleDB deferred to a dedicated time-series tier (Phase 2+).
- **Delivery (ADR-0007)**: **Helm chart + Kustomize overlays + Argo CD** (GitOps). Raw manifests
  moved to `infrastructure/kubernetes/legacy/`.
- **State (ADR-0008)**: Terraform **remote state** (S3 + DynamoDB, DR via replication).
- **Secrets (ADR-0009)**: **AWS Secrets Manager + KMS CMK + External Secrets Operator** (IRSA),
  automatic rotation, least-privilege IAM. No static secrets in git/manifests.
- **Observability (ADR-0010)**: **OpenTelemetry** → Prometheus/Loki/Tempo + Grafana + Alertmanager.
- **CI/CD (ADR-0011)**: GitHub Actions with **OIDC** (no static keys), SAST/dep/image/IaC
  scanning, SBOM + signing, gated Terraform plan/apply.
- **Testing (ADR-0012)**: health + contract (now), integration/smoke/perf/chaos (roadmap).
- **Security**: Helmet, CORS, JWT, RBAC guard, secrets via SM/ESO. No secrets in repo.

## Boundaries (enforced later)

- Each `apps/*` is independently deployable and failure-isolated.
- Domain events flow on Kafka with an Outbox pattern (ADR-0004).
- Broker/Market/AI logic are deliberately absent in Phase 0.

## Diagrams
See `docs/diagrams.md` (Diagram Index, ADRs 0004–0012) and `docs/technology-matrix.md`.

## Readiness
See `docs/architecture-readiness-report.md` — verdict ✅ READY FOR PHASE 0B after the 10
board-mandated changes.
