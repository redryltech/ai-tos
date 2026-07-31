# Environment Variables

Defined and validated in `packages/config`. All are optional with safe defaults for local dev.
Production secrets are **never** committed — see ADR-0009 (AWS Secrets Manager + External
Secrets Operator). This document reflects the post-Review-Board contract (ADRs 0004–0006).

## Application / services

| Var | Default | Purpose | ADR |
|---|---|---|---|
| `NODE_ENV` | development | Runtime mode | — |
| `LOG_LEVEL` | info | Log verbosity | — |
| `PORT` | 4000 | API port | — |
| `DATABASE_URL` | postgresql://ai-tos:ai-tos@localhost:5432/ai_tos | Primary OLTP (RDS PostgreSQL 16) | 0006 |
| `REDIS_URL` | redis://localhost:6379 | **Local dev only** (single Redis). Deprecated in prod. | 0005 |
| `REDIS_CACHE_URL` | redis://localhost:6379 | `redis-cache` cluster: app cache, indicators, semantic cache, pub/sub | 0005 |
| `REDIS_STATE_URL` | redis://localhost:6379 | `redis-state` cluster: sessions + rate limiting | 0005 |
| `KAFKA_BROKERS` | localhost:9092 | Event backbone bootstrap brokers (MSK) | 0004 |
| `SCHEMA_REGISTRY_URL` | http://localhost:8081 | Schema Registry endpoint | 0004 |
| `JWT_SECRET` | dev-insecure-change-me | JWT signing secret — **injected from Secrets Manager in prod** | 0009 |
| `JWT_EXPIRES_IN` | 15m | Access token TTL | — |
| `CORS_ORIGIN` | http://localhost:3000 | Allowed web origin | — |
| `AI_SERVICE_URL` | http://localhost:8000 | AI service base URL | — |
| `NEXT_PUBLIC_API_URL` | http://localhost:4000 | Web → API base URL | — |

## CI / cloud (GitHub Actions, OIDC — ADR-0011)

| Var / Secret | Purpose |
|---|---|
| `AWS_ROLE_ARN` (repo secret) | IAM role assumed via OIDC (no static keys) |
| `AWS_REGION` (repo var) | Deployment region |
| `ECR_REGISTRY` (repo var) | Amazon ECR registry for image push |

## Notes
- In prod, `DATABASE_URL`, `JWT_SECRET`, and the Redis URLs' *credentials* (if any) come
  from Secrets Manager via ESO; only non-secret endpoints live in the ConfigMap.
- `REDIS_URL` remains for local `docker-compose` convenience; deployed manifests use the
  split `REDIS_CACHE_URL` / `REDIS_STATE_URL` (see `infrastructure/kubernetes/helm/ai-tos`).
