# AI-TOS — Changelog

All notable changes to this project are documented in this file.

The format follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## [Unreleased]

### Planned
- Phase **2.1.8** — Provider SDK Contracts

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
