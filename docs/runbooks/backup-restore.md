# Backup Restore Verification (Phase 0B.8)

Prove restores work in **staging** before relying on them in production.

## RDS

1. Take / confirm automated snapshot exists.
2. Restore snapshot to ephemeral instance (`ai-tos-restore-test-*`).
3. Run `packages/database` migrate dry connection + `SELECT 1`.
4. Destroy ephemeral instance within 24h.
5. Log evidence (snapshot id, restore duration) in ticket.

## Redis state

1. Create manual backup/snapshot (ElastiCache).
2. Restore to temporary cluster; verify keyspace sample (non-prod data).
3. Delete temporary cluster.

## MSK / S3 backups

1. Confirm topic retention ≥ RPO window.
2. Confirm backup/log buckets versioning + CRR enabled (foundation modules).
3. Spot-check object restore from versioned key in staging account.

## Cadence

| Check | Frequency |
|---|---|
| RDS restore test | Monthly |
| Redis state snapshot test | Quarterly |
| Bucket CRR spot-check | Quarterly |
