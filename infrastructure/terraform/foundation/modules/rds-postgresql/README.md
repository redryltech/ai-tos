# RDS PostgreSQL module (Phase 0B.3)

Production PostgreSQL 16 platform (ADR-0006).

- **Engine:** PostgreSQL 16, `gp3` storage with **storage autoscaling** (`max_allocated_storage`).
- **Multi-AZ:** `multi_az = true` primary; automatic failover to a standby in another AZ.
- **Private only:** DB subnet group in the `data` subnet tier; SG allows 5432 from app SG/CIDR only.
- **Encryption:** KMS CMK at rest; `rds.force_ssl=1` enforces TLS in transit.
- **Backups / PITR:** `backup_retention_period` (14d default), `backup_window`, PITR via automated
  backups; `copy_tags_to_snapshot` for governance.
- **Read replicas:** `read_replica_count` same-region replicas for read scaling / DR readiness.
- **Observability:** Performance Insights enabled; Enhanced Monitoring (60s) via dedicated IAM role;
  `postgresql` + `upgrade` logs exported to CloudWatch.
- **Auth:** IAM DB auth enabled (readiness); master password auto-managed in **Secrets Manager**
  (`manage_master_user_password`) — no hardcoded secrets; rotation handled by Secrets Manager
  (ADR-0009). App credentials should be separate, least-privilege roles created per service.
- **Connection limits:** `max_connections` set in the parameter group.
- **Maintenance:** `maintenance_window` + `auto_minor_version_upgrade`; major upgrades are manual
  (`allow_major_version_upgrade = false`) for controlled upgrades.

No TimescaleDB / Aurora (per ADR-0006). A dedicated time-series tier is a later phase.
