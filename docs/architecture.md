# Architecture Overview

AI-TOS Phase 0 is a modular, cloud-native monorepo. No trading or AI decision logic is
implemented; this is the production-grade foundation. This document reflects the
**post-Review-Board** decisions (ADRs 0004–0012).

## Layers

- **Web** (`apps/web`, Next.js): dashboard shell, auth UI, theming, React Query.
- **API** (`apps/api`, NestJS): REST + (future) WS, Swagger, RBAC, audit interceptor, `/health`.
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
