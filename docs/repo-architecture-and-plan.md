# Repository Architecture & Implementation Plan (Phase 0)

**Status:** Approved for scaffolding · No business logic.

## 1. Goals
- `git clone` → one command → all services healthy → login → empty dashboard → CI green → infra deployable.
- Modular, enterprise-grade foundation that supports 5–10 years of AI-TOS growth.

## 2. Principles (challenge-resistant)
- **Independence:** each `apps/*` is its own deployable; `packages/*` are shared libs.
- **No business logic in Phase 0:** only health, auth scaffolding, skeletons.
- **Contracts first:** shared types (`@ai-tos/shared`) are the API/SDK contract.
- **Observability by default:** every service exposes `/health`, structured logs, metrics.
- **Security by default:** RBAC, Helmet, CORS, rate-limit, secrets via env/SM.

## 3. Tech decisions
| Area | Choice | Rationale |
|---|---|---|
| Monorepo | pnpm + Turbo | Fast, cached, incremental builds |
| Web | Next.js 14 (App Router) | SSR, RSC, ecosystem |
| API | NestJS 10 | Modules, DI, guards, Swagger |
| AI | Python FastAPI | LangGraph/LangChain-ready |
| Hot path | Go | Low-latency workers |
| DB | RDS PostgreSQL 16 (+ dedicated TimescaleDB tier later) | Relational system of record; time-series deferred (ADR-0006) |
| Cache/Stream | Redis (split: cache + state) + Kafka bus | Volatile cache + sessions/limits; Kafka owns events (ADR-0004/0005) |
| Infra | Terraform (remote state) + AWS EKS | Reproducible, managed, locked state (ADR-0008) |

## 4. Build order (generated this phase)
1. Root tooling (pnpm/turbo/tsconfig/eslint/prettier/husky/commitlint).
2. Packages (shared, config, ui, sdk, database).
3. Apps (web, api, ai-service, Go workers).
4. Infra (terraform, docker, kubernetes).
5. CI/CD (.github), DX (.vscode, devcontainer), docs, templates.

## 5. Verification
- TS: `pnpm install && turbo build` (compiles in this environment).
- Python: `python -m py_compile` (compiles in this environment).
- Go/Terraform/Docker/K8s: written to standard; validated by CI + your environment (not installed here).

## 6. Known limitations of this scaffold
- Auth issues a JWT but has **no user store** (Phase 1 connects identity).
- Broker/Market/AI logic are skeletons only.
- Terraform uses variables; `terraform apply` requires AWS credentials + backend config.
