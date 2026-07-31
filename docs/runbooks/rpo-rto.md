# RPO / RTO Runbooks (Phase 0B.8)

Targets for AI-TOS platform data planes. Adjust after first staging drill.

| System | RPO | RTO | Mechanism |
|---|---|---|---|
| RDS PostgreSQL 16 | ≤ 5 min | ≤ 30 min | Multi-AZ + PITR; promote replica / restore to point-in-time |
| Redis cache | N/A (volatile) | ≤ 15 min | Rebuild from empty; app cold-start |
| Redis state | ≤ 1 min (AOF) | ≤ 30 min | Multi-AZ / restore from snapshot if configured |
| MSK (Kafka) | ≤ 1 min | ≤ 60 min | Multi-AZ brokers; replay from earliest retained offset |
| Terraform state CRR | ≤ 15 min | ≤ 60 min | S3 versioning + cross-region replication (ADR-0008) |

## RDS PITR

1. Identify failure window; note `recovery_target_time` (UTC).
2. `aws rds restore-db-instance-to-point-in-time` into new instance in same VPC/subnets.
3. Update Secrets Manager `DATABASE_URL`; External Secrets sync; roll API pods.
4. Verify `/api/health` + smoke (`scripts/smoke.sh`).
5. Retire failed instance after sign-off.

## Redis

- **Cache:** flush/recreate cluster; no restore.
- **State:** snapshot restore or failover; invalidate sessions if RPO exceeded; force re-auth.

## MSK

1. Confirm remaining brokers healthy; wait for ISR recovery.
2. If topic loss: recreate from `kafka-topics` Terraform; consumers replay from checkpoint/earliest.
3. Check DLQ depth alerts before declaring green.

## State CRR (TF / backups)

1. Fail over reads to DR-region replica bucket if primary unavailable.
2. Re-point backend config; `terraform init -reconfigure`.
3. Document new primary; schedule failback.
