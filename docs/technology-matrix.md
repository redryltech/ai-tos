# Technology Decision Matrix (final)

**AI-TOS · Phase 0A → 0B gate · 2026-07-30**
Status: ✅ = decided & documented · ⚠ = decided, implementation in later phase · 🔲 = deferred.

| # | Area | Final choice | Rejected / alt | Status | ADR |
|---|---|---|---|---|---|
| 1 | Package mgmt | **pnpm** (+ workspaces) | npm, Yarn | ✅ | 0001 |
| 2 | Build orchestration | **Turbo** | Nx, Lerna | ✅ | 0001 |
| 3 | TS module system | **CommonJS** (packages) | ESM-only | ✅ | 0002 |
| 4 | Web framework | **Next.js 14** (App Router) | React+Vite SPA (revisit) | ✅ | (plan) |
| 5 | API framework | **NestJS 10** | Fastify, Express | ✅ | (plan) |
| 6 | AI service | **Python FastAPI** | Flask, Django | ✅ | (plan) |
| 7 | Hot-path workers | **Go 1.22** | Rust (future) | ✅ | (plan) |
| 8 | Primary database | **Amazon RDS for PostgreSQL 16** | Aurora (future path), TimescaleDB (dedicated TS tier later) | ✅ | 0006 |
| 9 | Time-series store | **RDS PostgreSQL + timescaledb (separate instance, Phase 2+)** | primary TimescaleDB (rejected) | 🔲 | 0006 |
| 10 | Cache / state | **ElastiCache (2 clusters): redis-cache + redis-state** | single cluster (rejected) | ✅ | 0005 |
| 11 | Event backbone | **Apache Kafka (Amazon MSK)** | Redis Streams, NATS JetStream (fallback) | ✅ | 0004 |
| 12 | Schema governance | **Schema Registry** (Glue/Confluent) | none (rejected) | ⚠ | 0004 |
| 13 | Container orchestration | **Amazon EKS** | ECS Fargate (fallback if EKS unproven) | ✅ | (plan) |
| 14 | IaC | **Terraform** (+ AWS provider) | Pulumi, CDK, Crossplane | ✅ | (plan) |
| 15 | Terraform state | **S3 + DynamoDB (remote, locked, DR)** | local (rejected) | ✅ | 0008 |
| 16 | K8s delivery | **Helm + Kustomize + Argo CD** | raw kubectl YAML (rejected) | ✅ | 0007 |
| 17 | Local dev | **Docker Compose / Tilt** | — | ✅ | (plan) |
| 18 | Ingress / edge | **ALB + Ingress NGINX + Cert-Manager** | API Gateway, Traefik (alt) | ✅ | (plan) |
| 19 | Metrics | **Prometheus / Amazon Managed Prometheus** | Datadog (sink) | ✅ | 0010 |
| 20 | Dashboards | **Grafana** | CloudWatch (alt) | ✅ | 0010 |
| 21 | Logs | **Loki** (+ CloudWatch) | ELK (heavier) | ✅ | 0010 |
| 22 | Tracing | **OpenTelemetry → Tempo / X-Ray** | vendor-only (rejected) | ✅ | 0010 |
| 23 | Alerting | **Alertmanager / AMP rules** | — | ✅ | 0010 |
| 24 | CI | **GitHub Actions** | GitLab, Jenkins | ✅ | 0011 |
| 25 | CI auth | **OIDC → AWS** | static keys (rejected) | ✅ | 0011 |
| 26 | Scanning | **CodeQL + Trivy + Dependabot/Renovate + Syft/Cosign** | none (rejected) | ✅ | 0011 |
| 27 | Secrets store | **AWS Secrets Manager + KMS CMK** | static K8s Secret (rejected) | ✅ | 0009 |
| 28 | Secret sync | **External Secrets Operator (IRSA)** | Sealed Secrets (alt) | ✅ | 0009 |
| 29 | Secret rotation | **Automatic (30–90d)** | manual (rejected) | ✅ | 0009 |
| 30 | Testing | **Health + Contract + Integration + Smoke + Perf + Chaos** | e2e-only (rejected) | ⚠ | 0012 |

> "Revisit" items (Next.js vs Vite SPA; EKS vs ECS proof) are tracked as board follow-ups;
> current choices are documented and defensible. No dimension is undecided.
