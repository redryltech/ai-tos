# AI-TOS — Architecture Decisions

ADR-style decision log for the project documentation system.  
Authoritative detailed records live in [`docs/adrs/`](../adrs/). This file summarizes accepted platform decisions and reserves space for future ones.

**Status legend:** Accepted · Proposed · Superseded · Deferred

---

## Index

| ID | Decision | Status | Phase | Date |
|---|---|---|---|---|
| D-001 | Monorepo | Accepted | 0A | 2026-07-30 |
| D-002 | TurboRepo | Accepted | 0A | 2026-07-30 |
| D-003 | PNPM | Accepted | 0A | 2026-07-30 |
| D-004 | Terraform | Accepted | 0A | 2026-07-30 |
| D-005 | Amazon EKS | Accepted | 0A / 0B.2 | 2026-07-30 |
| D-006 | PostgreSQL (RDS 16) | Accepted | 0A / 0B.3 | 2026-07-30 |
| D-007 | Redis (split cache/state) | Accepted | 0A / 0B.3 | 2026-07-30 |
| D-008 | Kafka (Amazon MSK) | Accepted | 0A / 0B.4 | 2026-07-30 |
| D-009 | Helm (+ Kustomize + Argo CD) | Accepted | 0A / 0B.5 | 2026-07-30 |
| D-010 | GitHub Actions | Accepted | 0A | 2026-07-30 |
| D-011 | AI Kernel ownership model | Accepted | 2.2 | 2026-08-04 |
| D-012+ | Future decisions | — | — | — |

---

## D-001 — Monorepo

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0001](../adrs/0001-monorepo-tooling.md) |

### Context
AI-TOS needs many deployables (web, API, AI service, workers) sharing contracts and tooling without multi-repo version drift.

### Decision
Use a **single monorepo**. `apps/*` are independently deployable services; `packages/*` are shared libraries.

### Alternatives considered
- Multi-repo per service
- Separate platform vs product repositories

### Consequences
- Unified CI, shared types, atomic cross-cutting changes.
- Requires disciplined package boundaries and Turbo caching.

---

## D-002 — TurboRepo

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0001](../adrs/0001-monorepo-tooling.md) |

### Context
Monorepo builds must stay fast as packages and apps grow.

### Decision
Use **TurboRepo** for task orchestration (`build`, `lint`, `typecheck`, `test`, `dev`) with remote/local caching.

### Alternatives considered
- Nx
- Lerna / custom scripts only

### Consequences
- Incremental, cached pipelines; consistent root scripts via `pnpm` + `turbo`.

---

## D-003 — PNPM

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0001](../adrs/0001-monorepo-tooling.md) |

### Context
Need a fast, strict package manager with first-class workspaces.

### Decision
Use **pnpm** (`pnpm@9`) workspaces as the package manager (`packageManager` field + Corepack).

### Alternatives considered
- npm workspaces
- Yarn Berry

### Consequences
- Content-addressable store, strict dependency isolation, workspace protocol for internal packages.

---

## D-004 — Terraform

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0008](../adrs/0008-terraform-state.md), [0013](../adrs/0013-cloud-foundation.md) |

### Context
Cloud resources must be reproducible, reviewable, and environment-isolated.

### Decision
Use **Terraform** for AWS IaC with **remote state** (S3 + DynamoDB locking, versioning, DR).

### Alternatives considered
- AWS CDK
- Pulumi
- Crossplane-only

### Consequences
- Module-first foundation (`infrastructure/terraform/foundation`).
- Plan/apply gated in CI (OIDC); no local-only state for shared environments.

---

## D-005 — Amazon EKS

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0014](../adrs/0014-eks-platform.md) |

### Context
Need a managed Kubernetes platform for multi-service isolation, autoscaling, and GitOps.

### Decision
Use **Amazon EKS** (private API endpoint, managed node groups, IRSA, PSS).

### Alternatives considered
- ECS Fargate (fallback if EKS unproven)
- Self-managed kops / kubeadm

### Consequences
- Standard K8s ecosystem (Helm, Kustomize, Argo CD, ESO, OTel).
- Cluster foundation delivered in Phase 0B.2.

---

## D-006 — PostgreSQL

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0006](../adrs/0006-database.md), [0015](../adrs/0015-data-platform.md) |

### Context
Need a durable OLTP system of record with PITR and Multi-AZ HA.

### Decision
Use **Amazon RDS for PostgreSQL 16** as the primary database. Aurora rejected as default. TimescaleDB deferred to a dedicated time-series tier (Phase 2+).

### Alternatives considered
- Aurora PostgreSQL (default)
- Primary TimescaleDB
- DynamoDB-centric design

### Consequences
- Strong relational model + SQL migrations in `packages/database`.
- Secrets stored in Secrets Manager; apps consume via ESO/IRSA.

---

## D-007 — Redis

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0005](../adrs/0005-redis-architecture.md), [0015](../adrs/0015-data-platform.md) |

### Context
Cache, sessions, and rate limits have different durability and eviction needs. Event streaming must not share Redis with cache.

### Decision
Run **two ElastiCache Redis clusters**:
- `redis-cache` — volatile, LRU
- `redis-state` — durable (AOF), noeviction for sessions/limits

Redis Streams retired as the event bus.

### Alternatives considered
- Single Redis for cache + streams + sessions
- MemoryDB only

### Consequences
- Clear failure domains; Kafka owns events; apps read two Redis URLs.

---

## D-008 — Kafka

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0004](../adrs/0004-event-backbone.md), [0016](../adrs/0016-event-platform.md) |

### Context
Trading platforms require durable, ordered, replayable domain events with schema governance and DLQ.

### Decision
Use **Apache Kafka on Amazon MSK** with Schema Registry, topic/DLQ/retry conventions, IAM + SCRAM, TLS, and KMS.

### Alternatives considered
- Redis Streams
- NATS JetStream
- Kinesis-only

### Consequences
- Event platform in Phase 0B.4; Outbox/producers/consumers in later application phases.
- ADR-0003 (open choice) superseded by ADR-0004.

---

## D-009 — Helm

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0007](../adrs/0007-deployment-strategy.md) |

### Context
Raw `kubectl apply` manifests do not scale across environments or release lifecycles.

### Decision
Package workloads with **Helm**, specialize environments with **Kustomize overlays**, and deliver via **Argo CD** (GitOps). Raw manifests moved to `legacy/`.

### Alternatives considered
- Raw YAML only
- Kustomize-only
- Helm-only without GitOps

### Consequences
- Chart under `infrastructure/kubernetes/helm/ai-tos`.
- Overlays for dev/staging/prod; promotion of immutable images.

---

## D-010 — GitHub Actions

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-30 |
| **ADR** | [0011](../adrs/0011-cicd.md) |

### Context
CI/CD must authenticate to AWS without long-lived keys and enforce security gates before apply/deploy.

### Decision
Use **GitHub Actions** with **OIDC → AWS**, plus SAST, dependency, image, and IaC scanning, SBOM + signing, and gated Terraform plan/apply.

### Alternatives considered
- GitLab CI
- Jenkins
- Static AWS access keys in CI

### Consequences
- Workflows under `.github/workflows`.
- Protected Environments for staging/production reviewers.

---

## D-011 — AI Kernel ownership model

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Doc** | [`ai-kernel-ownership.md`](../ai-kernel-ownership.md) |

### Context
Layer 2 exposes six kernel managers with overlapping vocabulary (task state vs execution state vs lifecycle). Layer 3 needs a clear ownership contract to avoid divergent sources of truth.

### Decision
Document and enforce ownership as follows:
- Task Scheduler → task scheduling
- State Manager → execution state
- Resource Manager → resource allocation
- Lifecycle Manager → execution lifecycle
- Communication Manager → internal messaging
- Context Manager → runtime context  

Callers orchestrate the canonical flow; events are observational only.

### Alternatives considered
- Merge State and Lifecycle into one manager
- Make Task Scheduler the sole orchestrator of all managers

### Consequences
- Architecture doc is authoritative for Layer 3 design.
- No functional code change in Improvement 2.

---

## Related Accepted ADRs (reference)

| ADR | Title |
|---|---|
| 0002 | TS package module system (CommonJS) |
| 0009 | Secrets — SM + KMS + ESO + rotation |
| 0010 | Observability — OTel + Prometheus + Grafana + Loki + Tempo |
| 0012 | Testing strategy |
| 0013–0016 | Cloud / EKS / Data / Event platform phases |

---

## Future Decisions

> Add new entries below using the same template. Do not silently rewrite Accepted decisions — supersede them.

### Template

```markdown
## D-0XX — Title

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | YYYY-MM-DD |
| **ADR** | (link or TBD) |

### Context
…

### Decision
…

### Alternatives considered
…

### Consequences
…
```

### Reserved topics (not yet decided here)

| Topic | Notes |
|---|---|
| D-012 | Amazon Managed Prometheus vs self-hosted Prometheus on EKS (0B.6 refinement) |
| D-013 | Tempo vs AWS X-Ray as primary trace store |
| D-014 | Paper-trading broker adapter selection |
| D-015 | Primary LLM provider default + failover policy |
| D-016 | Multi-region active/active vs active/passive GA topology |
| D-017 | Tenant isolation model (RLS vs schema-per-tenant) |
| D-018 | Chaos tooling (Litmus vs Chaos Mesh) |

---

## Change Control

1. Propose → review → Accept (or Reject).
2. Accepted decisions are immutable; create a superseding ID instead of editing history.
3. Mirror significant decisions into `docs/adrs/` with the next ADR number.
