# AI-TOS — Changelog

All notable changes to this project are documented in this file.

The format follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## [Unreleased]

### Planned
- Phase **0B.6** — Observability Platform (Prometheus, Grafana, Loki, Tempo, OpenTelemetry)

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
| `v0.5.0` | Through **0B.5** | Current documented baseline |
| `v0.6.0` | Through **0B.6** | Observability Platform (planned) |
| `v1.0.0` | Phase **8** GA | Production release target |

---

## Links

- Roadmap: [`ROADMAP.md`](./ROADMAP.md)
- Status: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
- Next task: [`NEXT_TASK.md`](./NEXT_TASK.md)
