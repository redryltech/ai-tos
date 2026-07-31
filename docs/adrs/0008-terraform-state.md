# ADR-0008: Terraform remote state (S3 + DynamoDB)

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; backend enabled now)

## Context

Phase 0A left the `terraform` backend block commented out, relying on local state. The
board (verdict: ⚠ APPROVED WITH CHANGES, Priority 5) requires remote state with locking,
versioning, DR, and per-environment isolation before Phase 0B.

## Decision

Enable the **S3 backend** with **DynamoDB state locking**:

- **Bucket** `ai-tos-tfstate-<account-id>` — `versioning = Enabled`, `SSE-KMS`
  (dedicated CMK), `block_public_access = true`, `force_destroy = false`.
- **State key per environment** `ai-tos/<environment>/terraform.tfstate` (also acceptable:
  one bucket per environment for hard isolation).
- **DynamoDB table** `ai-tos-tflock` (`hash_key = LockID`, PITR enabled) for
  mutual-exclusion locking.
- **Cross-region replication (CRR)** of the state bucket to a DR region for disaster
  recovery; versioning enables rollback to any prior state.
- **Partial backend config:** the `backend "s3"` block uses no `variable` (HCL forbids
  it); per-environment values are supplied via `terraform init -backend-config=...`
  (a git-ignored `backend-<env>.tfvars`) or CI OIDC-injected env vars. Never commit
  bucket names with secrets.
- **Bootstrap:** the state bucket, DynamoDB table, and KMS key are created by a minimal
  `infrastructure/terraform/bootstrap/` (applied once with local state, then never again).

## Documentation requirements (all addressed)

- **S3 backend:** enabled, encrypted, versioned.
- **State locking:** DynamoDB `LockID` row.
- **Disaster recovery:** CRR to DR region + versioning + PITR on the lock table.
- **Versioning:** enabled for rollback to prior state revisions.
- **Environment isolation:** separate state keys (or buckets) per `environment`.

## Alternatives considered

- **Local state** — *Rejected* (current): no locking, no DR, not shareable by CI.
- **Terraform Cloud / HCP** — viable, but we standardize on AWS-native S3+DynamoDB.
- **S3 only (no DynamoDB)** — *Rejected*: no native locking → corruption risk under
  concurrent CI.

## Consequences

- Safe, collaborative, CI-friendly state with locking and DR.
- Bootstrap step required once; backend config externalized per env.
- State contains secrets-in-plan only transiently; bucket is KMS-encrypted + private.

## References

- `infrastructure/terraform/main.tf` (backend enabled),
  `infrastructure/terraform/bootstrap/` (state bucket + table + KMS),
  `docs/review-board-changes.md` Priority 5.
