# Architecture Review Board — Approved Changes Implementation

**Project:** AI-TOS (AI Trading Operating System) · Phase 0A foundation
**Verdict addressed:** ⚠ APPROVED WITH CHANGES
**Date:** 2026-07-30
**Scope:** Implementation of the 10 prioritized, board-mandated architectural improvements.
**Hard constraint honored:** No Phase 0B provisioning. No `terraform apply`, no `kubectl
apply`, no Docker build of runtime infra. Only decisions (ADRs), documentation, diagrams,
and the explicitly-required config edits (remote-state backend, secrets KMS/rotation,
RDS PostgreSQL cleanup, Helm/Kustomize restructure).

> For each change: **Problem · Reason · Solution · Files affected · Documentation updates ·
> Architecture impact · Risk · Migration impact · Confidence**.

---

## Priority 1 — Finalize the Event Backbone → Apache Kafka (MSK)

- **Problem:** ADR-0003 left the backbone as "Kafka or Redis Streams," so the core
  money-correct event flow had no committed technology. Redis was also doubling as the bus,
  coupling it to the cache.
- **Reason:** A trading system needs durable, ordered, replayable, governed events. The
  backbone must own durability independent of the cache tier.
- **Solution:** Adopt **Apache Kafka on Amazon MSK** (Redpanda as documented alternative).
  Mandate Schema Registry + Transactional Outbox + idempotent consumers + DLQ. Partition by
  aggregate key. Retire the Redis "stream" role (ADR-0005).
- **Files affected:** `docs/adrs/0003-event-bus.md` (superseded), `docs/adrs/0004-event-backbone.md` (new), `docs/architecture.md`, `docs/env-vars.md` (add `KAFKA_BROKERS`, `SCHEMA_REGISTRY_URL`), `.env.example`.
- **Documentation updates:** Event flow diagram, ADR index, technology matrix, readiness report.
- **Architecture impact:** Kafka becomes the durable spine; Redis freed from streaming; Outbox + DLQ become first-class.
- **Risk:** New operational surface (brokers, registry, relay). **Low–Med** (MSK managed).
- **Migration impact:** None (greenfield). Phase 1+ builds Outbox relay + producers/consumers.
- **Confidence:** 0.95

---

## Priority 2 — Redis Role Separation

- **Problem:** One ElastiCache cluster served cache + streams + sessions + rate limiting — a
  single point of failure; a cache storm could evict sessions.
- **Reason:** Security-sensitive, stateful usage (sessions, limits) must not share failure
  domain with volatile cache.
- **Solution:** Two clusters — `redis-cache` (volatile, `allkeys-lru`, no persistence,
  ephemeral pub/sub) and `redis-state` (sessions + rate limiting, AOF, `noeviction` for
  sessions). Streams role retired (Kafka owns it). New contract: `REDIS_CACHE_URL`,
  `REDIS_STATE_URL`.
- **Files affected:** `docs/adrs/0005-redis-architecture.md` (new), `docs/env-vars.md`, `.env.example`, `infrastructure/terraform/modules/elasticache/main.tf` (split into cache/state modules), `infrastructure/kubernetes/...` (two Redis services), `apps/api/src/main.ts` (config wiring — Phase 0B).
- **Documentation updates:** Redis topology diagram, env-vars, architecture.md.
- **Architecture impact:** Clear blast-radius boundaries; cache failure ≠ session loss.
- **Risk:** Two connection pools; marginally higher cost. **Low.**
- **Migration impact:** Update all services to read two URLs (Phase 0B). Env rename is backward-incompatible by design.
- **Confidence:** 0.95

---

## Priority 3 — Database Decision → Amazon RDS for PostgreSQL

- **Problem:** Ambiguous "Postgres + TimescaleDB" with an open Aurora vs TimescaleDB
  question; the RDS module preloaded `timescaledb` on the primary instance.
- **Reason:** Need a clear, supportable system of record now; time-series is a future,
  separate concern.
- **Solution:** **RDS for PostgreSQL 16** as primary OLTP (Multi-AZ prod, KMS-encrypted,
  PITR, read replicas). **Reject Aurora** as default (kept as future path). **Reject
  TimescaleDB** as primary engine (defer to a dedicated time-series instance in Phase 2+).
  Remove `timescaledb` preload from the primary parameter group.
- **Files affected:** `docs/adrs/0006-database.md` (new), `infrastructure/terraform/modules/rds/main.tf` (drop `timescaledb` preload; clean PG parameter group), `docs/architecture.md`, `docs/deployment.md`.
- **Documentation updates:** Data-tier diagram, scaling/migration plan, readiness report.
- **Architecture impact:** Unambiguous primary DB; time-series isolated to a future tier.
- **Risk:** None material. **Very Low.**
- **Migration impact:** Greenfield; future schema migrations via `packages/database/migrations`, blue-green via RDS clone.
- **Confidence:** 0.97

---

## Priority 4 — Deployment Strategy → Helm + Kustomize (GitOps)

- **Problem:** Raw `kubectl apply -f` manifests are not environment-aware, unversioned,
  un-rollbackable, and duplicate across envs.
- **Reason:** Need templating, release lifecycle, and clean per-env promotion before Phase 0B.
- **Solution:** **Helm chart** (`helm/ai-tos`) packages apps; **Kustomize overlays**
  (`kustomize/overlays/{dev,staging,prod}`) patch per env + install cluster add-ons
  (External Secrets Operator, Ingress NGINX, Cert-Manager, Metrics Server, HPA,
  NetworkPolicies). **Argo CD** reconciles from git. Raw manifests moved to
  `infrastructure/kubernetes/legacy/` (reference only).
- **Files affected:** `docs/adrs/0007-deployment-strategy.md` (new), `infrastructure/kubernetes/helm/ai-tos/*` (new chart), `infrastructure/kubernetes/kustomize/*` (new overlays), `infrastructure/kubernetes/legacy/*` (moved raw YAML), `docs/deployment.md`.
- **Documentation updates:** Deployment guide rewritten for Helm/Kustomize/Argo CD; diagram.
- **Architecture impact:** Env promotion = git change; rollback first-class; add-ons declarative.
- **Risk:** Learning curve; charts must be linted/versioned. **Low–Med.**
- **Migration impact:** Re-apply via Helm/Kustomize; legacy YAML retired. Deploys unchanged at runtime.
- **Confidence:** 0.93

---

## Priority 5 — Terraform Remote State (S3 + DynamoDB)

- **Problem:** Backend block commented out → local state, no locking, no DR, not CI-shareable.
- **Reason:** Concurrent CI + collaboration require locked, versioned, recoverable state.
- **Solution:** Enable **S3 backend** with **DynamoDB** locking: versioned, SSE-KMS,
  block-public-access bucket `ai-tos-tfstate-<acct>`; per-env state key; lock table
  `ai-tos-tflock` (PITR); **cross-region replication** for DR; partial config via
  `-backend-config`. A minimal `bootstrap/` creates bucket + table + KMS once.
- **Files affected:** `docs/adrs/0008-terraform-state.md` (new), `infrastructure/terraform/main.tf` (backend enabled), `infrastructure/terraform/bootstrap/main.tf` (new: bucket + DynamoDB + KMS), `infrastructure/terraform/variables.tf` (docs).
- **Documentation updates:** State/DR section, readiness report, tech matrix.
- **Architecture impact:** Safe collaborative state with rollback + DR.
- **Risk:** Bootstrap must run once before any apply; backend config must stay externalized. **Low.**
- **Migration impact:** `terraform init -migrate-state` moves local → remote on first enable.
- **Confidence:** 0.96

---

## Priority 6 — Secrets → AWS Secrets Manager + KMS + ESO + Rotation + Least Privilege

- **Problem:** Static K8s Secret with `CHANGE_ME`; SM secret with hardcoded placeholder,
  AWS-default encryption key, no rotation, no scoped IAM.
- **Reason:** Production secrets need encryption with CMK, automatic rotation, audit, and
  minimal blast radius.
- **Solution:** Secrets in **AWS Secrets Manager** encrypted with a **dedicated KMS CMK**;
  **automatic rotation** (DB creds 30–90d, LLM keys on compromise); **External Secrets
  Operator** syncs SM→K8s via **IRSA** (OIDC); **per-service IAM** with `secretsmanager:GetSecretValue` scoped to each secret ARN; static `secret.yaml` deleted. Break-glass documented.
- **Files affected:** `docs/adrs/0009-secrets-management.md` (new), `infrastructure/terraform/modules/secrets/main.tf` (KMS + rotation + scoped), `infrastructure/kubernetes/kustomize/...` (ESO install + `ExternalSecret`s; delete `secret.yaml`), `docs/security`/env-vars, `.github/workflows/*` (OIDC).
- **Documentation updates:** Secrets architecture diagram, security section, env-vars.
- **Architecture impact:** No secret in git/manifests; rotation automatic; pods/creds least-privilege.
- **Risk:** Rotation misconfiguration could break DB auth → tested in staging first. **Low–Med.**
- **Migration impact:** Populate SM via CI/OIDC; ESO replaces static secret; no app code change beyond config URLs.
- **Confidence:** 0.94

---

## Priority 7 — Observability → OTel + Prometheus + Grafana + Loki + Alertmanager

- **Problem:** Only `/health` + structured logs declared; no tracing/metrics/logging pipeline.
- **Reason:** Money-correct, distributed systems need correlated traces/metrics/logs + alerts.
- **Solution:** **OpenTelemetry** standard (OTLP) → **Prometheus/AMP** (metrics, ServiceMonitors), **Loki** (logs), **Tempo/X-Ray** (traces), **Grafana** (dashboards-as-code), **Alertmanager** (severity-tiered alerts incl. DLQ depth, rotation failures, Redis/Kafka/PG health). OTel Collector DaemonSet + Gateway with sampling.
- **Files affected:** `docs/adrs/0010-observability.md` (new), `docs/observability.md` (new), `infrastructure/kubernetes/kustomize/...` (Collector/ Prometheus/Loki/Grafana/Alertmanager installs), `apps/**` (instrumentation — Phase 0B).
- **Documentation updates:** Observability diagram + signal-flow; readiness report.
- **Architecture impact:** Unified, portable, correlated observability; no vendor lock-in at SDK.
- **Risk:** Operational surface + cost → mitigated by managed backends + sampling. **Med.**
- **Migration impact:** Add OTel SDK per service in Phase 0B; no behavior change.
- **Confidence:** 0.92

---

## Priority 8 — CI/CD → OIDC + Security Scanning + Gated Terraform

- **Problem:** No cloud auth, no scanning, Terraform ran `init -backend=false` without creds.
- **Reason:** Need non-repudiable, vulnerability-gated, auditable pipelines before Phase 0B.
- **Solution:** **OIDC** to AWS (no static keys) for app + Terraform + ESO. **Scanning:**
  CodeQL/Semgrep (SAST), Dependabot/Renovate + `npm audit`/`pip-audit`/`govulncheck`
  (deps), **Trivy** image + IaC scan (fail HIGH/CRITICAL), **Syft** SBOM, **Cosign** sign.
  **Terraform:** `plan` on PR (OIDC) posted as comment; `apply` only on `main`/protected
  env with required reviewers.
- **Files affected:** `docs/adrs/0011-cicd.md` (new), `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/terraform.yml`, `.github/workflows/security.yml` (new), `docs/security`/contributing.
- **Documentation updates:** CI/CD diagram + strategy, readiness report.
- **Architecture impact:** No long-lived keys; vulns caught pre-merge; Terraform reviewed + gated.
- **Risk:** Longer pipelines; required reviewers add friction. **Low.**
- **Migration impact:** Replace static secrets with OIDC role; add scan jobs (green today).
- **Confidence:** 0.95

---

## Priority 9 — Testing → Health / Contract / Integration / Smoke / Perf / Chaos

- **Problem:** Only `echo`/syntax checks; no contract, integration, smoke, perf, or chaos.
- **Reason:** Foundation needs verifiable plumbing + contracts; resilience must be planned.
- **Solution:** Define the pyramid (table in ADR-0012): **Health** (every service, CI +
  post-deploy), **Contract** (OpenAPI + Schema Registry + `@ai-tos/shared` types),
  **Integration** (Testcontainers PG+Kafka, Phase 1+), **Smoke** (post-deploy, Phase 0B),
  **Performance** (k6 baseline SLOs, Phase 1+), **Chaos** (Litmus/Chaos Mesh in staging,
  Phase 2+). Phase 0A scope = health + contract + smoke scaffold only; no business tests.
- **Files affected:** `docs/adrs/0012-testing-strategy.md` (new), `docs/testing.md` (new), `apps/**/...` (health + contract tests), `.github/workflows/ci.yml` (contract/health jobs).
- **Documentation updates:** Testing strategy doc + diagram; readiness report.
- **Architecture impact:** Fast feedback + confidence gates + resilience evidence.
- **Risk:** Test infra to operate later. **Low.**
- **Migration impact:** Add contract tests now; integration/perf/chaos in later phases.
- **Confidence:** 0.93

---

## Priority 10 — Architecture Review: Consistency Pass

- **Problem:** Decisions were scattered/inconsistent (event bus open, Redis conflated, DB
  ambiguous, raw k8s, local TF state, placeholder secrets, no observability/CI hardening).
- **Reason:** The board requires a coherent, internally consistent foundation before Phase 0B.
- **Solution:** New ADRs 0004–0012 + supersede 0003; updated `architecture.md`,
  `deployment.md`, `env-vars.md`; new `diagrams.md` (Diagram Index + mermaid); new
  `technology-matrix.md`; updated `adrs/README.md`; consistency verification (every
  reference to "Redis Streams as bus", "Aurora", "TimescaleDB primary", "raw kubectl",
  "local state", "static secret" resolved).
- **Files affected:** all docs above + `README.md` (repo map), `docs/adrs/README.md`.
- **Documentation updates:** this document, readiness report, tech matrix, ADR index, diagram index.
- **Architecture impact:** Single coherent narrative across ADRs, diagrams, and code config.
- **Risk:** Doc drift if not maintained → quarterly ADR review (per review board). **Low.**
- **Migration impact:** None (documentation + decisions only).
- **Confidence:** 0.98

---

## Cross-cutting confidence & open items

- All 10 changes implemented as **decisions + documentation + diagrams + required config**.
- Explicitly **deferred to later phases (not Phase 0A gaps):** Outbox relay code,
  OTel SDK instrumentation, ESO runtime install, Helm chart apply, Terraform `apply`,
  integration/perf/chaos harness, tenant model + DR runbooks (scaffolded in ADRs, built
  Phase 1+). These are correctly out of Phase 0A scope per the foundation mandate.
- **Verdict after changes:** ✅ READY FOR PHASE 0B (see `architecture-readiness-report.md`).
