# ADR-0015: Data Platform (Phase 0B.3)

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** Principal Database / Platform Engineering
- **Phase:** 0B.3 (data foundation only — no applications)

## Context

Phase 0B.1 (landing zone) and 0B.2 (EKS) are complete. We now need the production-ready data
infrastructure (relational + cache/state) that future AI-TOS services will use. The event
backbone (Kafka/MSQ) is a later phase (ADR-0004); the database and Redis tiers are built now.

## Decision

- **RDS for PostgreSQL 16** (ADR-0006): Multi-AZ primary + same-region read replicas, private
  `data` subnet tier, KMS-encrypted, automated backups + PITR, Performance Insights, Enhanced
  Monitoring, `rds.force_ssl=1`, IAM auth enabled, `gp3` with storage autoscaling. Master
  password auto-managed in **Secrets Manager** (`manage_master_user_password`) — no hardcoded
  secrets (ADR-0009). No TimescaleDB/Aurora (per ADR-0006; time-series is a later tier).
- **Split Redis (ADR-0005):**
  - *Redis Cache* — volatile application cache, `allkeys-lru`, **no persistence** (`snapshot_retention_limit=0`).
  - *Redis State* — sessions/rate-limit/platform state, `noeviction` + **AOF** (`appendonly=yes`,
    `appendfsync=everysec`) + 1 snapshot, so state survives node recycle within RPO.
- **Storage:** `gp3` baseline, autoscaling via `max_allocated_storage`; snapshots + lifecycle to
  the backup bucket; cross-region CRR for DR (reuses 0B.1 DR pattern).
- **Networking:** DB in `data` tier (no NAT/IGW route); Redis in `app` tier; SGs restrict 5432/6379
  to app CIDRs/SGs; TLS + KMS enforced.
- **Security:** KMS CMK at rest, TLS in transit, Secrets Manager (rotation-ready), least-privilege
  per-service DB roles (pattern documented), CloudTrail + RDS logs to central audit bucket.
- **HA/DR:** Multi-AZ failover, read replicas, PITR (RPO < 5m), Multi-AZ standby (RTO < 15m),
  snapshot/backup retention = 14d (configurable).

## Why Redis Streams are NOT used
The event backbone is **Kafka/MSQ** (ADR-0004). Redis here is purely a cache + state store; using
Redis Streams as the message bus was explicitly rejected (SPOF with the cache tier, weaker
ordering/replay). Redis retains only cache (LRU) and durable state (sessions) roles.

## Alternatives considered
- **Aurora PostgreSQL:** *Rejected* as the default (ADR-0006) — RDS is simpler/cheaper for the
  current scale; Aurora remains a future scale-out option.
- **Single Redis cluster:** *Rejected* — mixing volatile cache with durable session state risks
  cache eviction dropping sessions; the split (ADR-0005) isolates failure modes.
- **RDS read replica as DR:** kept same-region for latency; cross-region replica + S3 CRR are the
  DR path (documented, enabled per environment later).

## Consequences
- Secure, HA, encrypted data platform ready for workloads in 0B.4+.
- Secrets Manager holds DB credentials; per-service least-privilege roles must be created in 0B.4.
- No event streaming yet (Kafka/MSQ is a later milestone, ADR-0004).

## Next milestone (Phase 0B.4)
Kafka/MSQ event backbone, External Secrets Operator wiring (consumes the Secrets Manager secret),
application Deployments/Services, and per-service DB/Redis roles + connection wiring.

## References
- `infrastructure/terraform/foundation/modules/rds-postgresql`, `redis-cache`, `redis-state`
- `infrastructure/terraform/foundation/environments/data`
- ADRs 0004 (Kafka), 0005 (Redis split), 0006 (RDS PG16), 0008 (remote state), 0009 (Secrets)
