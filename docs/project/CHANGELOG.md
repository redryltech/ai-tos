# AI-TOS — Changelog

All notable changes to this project are documented in this file.

The format follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## [Unreleased]

### Planned
- Phase **1** — Identity, Auth & Core Services

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
| `v1.0.0` | Phase **8** GA | Production release target |

---

## Links

- Roadmap: [`ROADMAP.md`](./ROADMAP.md)
- Status: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
- Next task: [`NEXT_TASK.md`](./NEXT_TASK.md)
