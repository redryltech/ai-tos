# AI-TOS — AI Trading Operating System

> **Phase 0 — Engineering Foundation (no business logic).**
> A cloud-native, modular, event-driven platform foundation. This repository contains
> **only the production-grade scaffold**: monorepo, services, infra, CI/CD, security,
> observability, and developer experience. No trading, market analysis, or AI decision code.

## Quick start

```bash
# 1. Prerequisites: Node 20+, pnpm (corepack enable), Docker, Python 3.11+, Go 1.22+, Terraform 1.7+
corepack enable
# 2. Install
pnpm install
# 3. Start everything (database, redis, api, web, workers) via Docker Compose
make dev
# 4. Open http://localhost:3000  (web)  ·  http://localhost:4000/docs  (api swagger)
```

`make bootstrap` runs install + lint + typecheck + a local DB migration so a fresh clone is runnable in one command.

## Repository map

```
ai-tos/
├── apps/            # Deployable services
│   ├── web/         # Next.js dashboard shell (no trading UI)
│   ├── api/         # NestJS REST + WS + RBAC + audit (foundation)
│   ├── ai-service/  # Python FastAPI (LLM adapter interfaces, no logic)
│   ├── market-worker/  # Go health + event consumer skeleton
│   ├── risk-worker/     # Go health + event consumer skeleton
│   ├── news-worker/     # Go health + event consumer skeleton
│   └── scheduler/       # Go scheduler skeleton
├── packages/        # Shared libraries
│   ├── shared/      # Types + Zod schemas
│   ├── ui/          # Component library (Tailwind + cva)
│   ├── config/      # Environment schema + constants
│   ├── sdk/         # Typed API client
│   └── database/    # pg pool + migrations + seeds
├── infrastructure/  # IaC
│   ├── terraform/   # AWS VPC/EKS/RDS/ElastiCache/S3/IAM/ALB/Route53/Secrets/CloudWatch + bootstrap
│   └── foundation/  # Phase 0B.1 cloud foundation: Org/VPC/IAM/KMS/S3/Security/Cost modules + envs (see its README)
│   ├── docker/      # Dockerfiles + docker-compose (local dev)
│   └── kubernetes/  # Helm chart (helm/ai-tos) + Kustomize overlays (dev/staging/prod) + legacy raw YAML
├── .github/         # Workflows, templates, policies
├── docs/            # Architecture, onboarding, ADRs
├── scripts/         # bootstrap, migrate, seed, dev
└── Makefile / Taskfile.yaml
```

See `docs/` for architecture, onboarding, local setup, deployment, env vars, coding standards,
branch and release strategy. See `docs/adrs/` for Architecture Decision Records (ADR-0001…0012).

## Architecture decisions (post-Review-Board)
The Architecture Review Board returned ⚠ APPROVED WITH CHANGES; all 10 mandated improvements
are implemented as ADRs + docs + diagrams. Highlights: **Kafka (MSK)** event backbone,
**split Redis** (cache/state), **RDS PostgreSQL 16**, **Helm + Kustomize + Argo CD** delivery,
**Terraform remote state**, **Secrets Manager + ESO + KMS + rotation**, **OpenTelemetry**
observability, **OIDC + scanning** CI/CD. See `docs/review-board-changes.md`,
`docs/technology-matrix.md`, and `docs/architecture-readiness-report.md` (verdict: ✅ READY FOR PHASE 0B).

## Quality bar

Maintainability · Scalability · Reliability · Security · Developer Experience · Long-term growth.
Every service is independently deployable, independently failure-isolated, and observable.
