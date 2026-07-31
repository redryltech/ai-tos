# ADR Index — AI-TOS

Architecture Decision Records. Status legend: **Accepted** · **Proposed** ·
**Superseded**.

| ADR | Title | Status | Date | Decision summary |
|---|---|---|---|---|
| [0001](./0001-monorepo-tooling.md) | Monorepo tooling (pnpm + Turbo) | Accepted | 2026-07-30 | pnpm workspace + Turbo; `apps/*` deployable, `packages/*` shared |
| [0002](./0002-module-system.md) | TS package module system (CommonJS) | Accepted | 2026-07-30 | All `packages/*` compile to CJS for NestJS + Next.js interop |
| [0003](./0003-event-bus.md) | Event bus + Outbox (future) | **Superseded** by 0004 | 2026-07-30 | Historical "Kafka or Redis Streams" proposal |
| [0004](./0004-event-backbone.md) | Event backbone — Apache Kafka (MSK) | Accepted | 2026-07-30 | Kafka on MSK + Schema Registry + Outbox + DLQ; Redis stream role retired |
| [0005](./0005-redis-architecture.md) | Redis role separation | Accepted | 2026-07-30 | Two clusters: `redis-cache` (volatile) + `redis-state` (sessions/limits); streams retired |
| [0006](./0006-database.md) | Primary database — RDS for PostgreSQL | Accepted | 2026-07-30 | RDS PostgreSQL 16 primary; Aurora rejected default; TimescaleDB deferred to separate tier |
| [0007](./0007-deployment-strategy.md) | K8s delivery — Helm + Kustomize + Argo CD | Accepted | 2026-07-30 | Helm charts + Kustomize overlays; GitOps; raw YAML → `legacy/` |
| [0008](./0008-terraform-state.md) | Terraform remote state (S3 + DynamoDB) | Accepted | 2026-07-30 | Remote state, locking, versioning, CRR DR, per-env isolation |
| [0009](./0009-secrets-management.md) | Secrets — SM + KMS + ESO + rotation | Accepted | 2026-07-30 | Secrets Manager + CMK + ESO/IRSA + auto rotation + least privilege |
| [0010](./0010-observability.md) | Observability — OTel + Prom + Grafana + Loki | Accepted | 2026-07-30 | OTel standard → Prometheus/Loki/Tempo + Grafana + Alertmanager (architecture) |
| [0011](./0011-cicd.md) | CI/CD — OIDC + scanning + gated TF | Accepted | 2026-07-30 | OIDC auth, SAST/dep/image/IaC scanning, SBOM+sign, Terraform plan/apply gate |
| [0012](./0012-testing-strategy.md) | Testing — health/contract/int/perf/chaos | Accepted | 2026-07-30 | Pyramid defined; health+contract in 0A, rest roadmap |
| [0013](./0013-cloud-foundation.md) | AWS Cloud Foundation (Phase 0B.1) | Accepted | 2026-07-30 | Multi-account Org; us-east-1/us-west-2; 3-tier VPC; IAM/KMS/S3/Security/Cost baseline |
| [0014](./0014-eks-platform.md) | EKS Kubernetes Platform (Phase 0B.2) | Accepted | 2026-07-30 | EKS 1.29; private endpoint; system+app node groups; IRSA; LB Controller; PSS |
| [0015](./0015-data-platform.md) | Data Platform (Phase 0B.3) | Accepted | 2026-07-30 | RDS PostgreSQL 16 (Multi-AZ, PITR, Secrets Mgr) + split Redis cache/state (ADR-0005/0006/0009) |
| [0016](./0016-event-platform.md) | Event Platform (Phase 0B.4) | Accepted | 2026-07-30 | Amazon MSK (Kafka 3.6, Multi-AZ, IAM+SCRAM), topic/DLQ strategy, Glue Schema Registry (Avro) |

## How to propose an ADR
Copy the format (Status, Date, Context, Decision, Alternatives, Consequences, References).
Accepted ADRs are immutable; supersede rather than edit. Review quarterly (per review board).

## Source of change
All ADRs 0004–0012 implement the Architecture Review Board verdict ⚠ APPROVED WITH CHANGES
(10 prioritized changes). See `docs/review-board-changes.md`.
