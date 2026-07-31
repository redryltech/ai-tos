# ADR-0006: Primary database — Amazon RDS for PostgreSQL

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; provisioning in Phase 0B)

## Context

The system of record must be relational (users, accounts, portfolios, audits, orders).
ADR-0002-era docs and the `rds` Terraform module implied "Postgres + TimescaleDB" and left
"Aurora vs TimescaleDB" open. The board (verdict: ⚠ APPROVED WITH CHANGES, Priority 3)
requires a final, unambiguous database architecture.

## Decision

**Primary OLTP store = Amazon RDS for PostgreSQL 16** (Multi-AZ in prod, encrypted at rest
with a customer KMS key, PITR backups ≥ 7 days, one or more read replicas for read-heavy
portfolio/analytics).

- **Aurora PostgreSQL — Rejected for now.** Aurora adds cost and a managed-engine lock-in
  for marginal benefit at our current scale. RDS PostgreSQL gives us the same PostgreSQL
  semantics with simpler operations and an easy *migration path* to Aurora later if peak
  throughput or read scaling demands it. Aurora remains a documented future option, not the
  default.
- **TimescaleDB — Rejected as the primary engine.** TimescaleDB is a PostgreSQL extension,
  not a separate product, but committing it to the primary OLTP DB couples hypertable
  lifecycle/extension upgrades to the system of record and adds operational risk before any
  time-series workload exists. The current `rds` module's `timescaledb` shared-preload
  library is **removed** from the primary instance.
- **Dedicated time-series store (future, Phase 2+):** when market-tick/candle volume
  justifies it, add a **separate** RDS PostgreSQL instance with the `timescaledb` extension
  (or Amazon Timestream) as an analytical/time-series tier, fed by logical replication.
  This keeps the OLTP system of record clean.

## Scaling plan

1. **Read replicas** for read-heavy portfolio/analytics (CQRS read models).
2. **Logical replication** to materialized read models (compute-on-write, cache in
   `redis-cache`).
3. **Partitioning** of hot tables (audit_logs, ticks) by time/tenant.
4. **Citus** (or Aurora Limitless) later only if >1M users / sharding is required.

## Migration plan

Greenfield — no data migration in Phase 0A. Future migrations (schema evolution) use:
flyway/Atlas-managed migrations in `packages/database/migrations`; blue-green via RDS
clone; `pg_dump`/`pg_restore` for one-off moves; logical replication for zero-downtime
cuts. Tenant model and DR RPO/RTO are defined in ADR-0009/runbooks (Phase 1+).

## Alternatives considered

- Aurora PostgreSQL (rejected default, kept as future path).
- TimescaleDB as primary (rejected; deferred to dedicated secondary store).
- Self-managed EC2 Postgres (rejected; ops burden, no managed HA/PITR).

## Consequences

- Clear, boring, supportable primary DB.
- Time-series handled by a purpose-built separate tier when needed.
- Removes the ambiguous "Postgres + TimescaleDB" coupling from the primary instance.

## References

- `infrastructure/terraform/modules/rds/main.tf` (updated), ADR-0009 (KMS),
  `docs/review-board-changes.md` Priority 3.
