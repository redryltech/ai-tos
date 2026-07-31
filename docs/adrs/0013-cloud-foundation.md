# ADR-0013: AWS Cloud Foundation (Phase 0B.1)

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** Principal Cloud Architect / Platform Engineering
- **Phase:** 0B.1 (platform foundation only)

## Context

Phase 0A defined the application/build scaffold and ADRs 0004–0012 set the *logical*
architecture (Kafka, split Redis, RDS PostgreSQL, Helm/Kustomize, remote state, Secrets
Manager, OTel, OIDC CI). Before any workload lands, we need the **AWS landing zone**: a
multi-account org, region strategy, VPC tiers, IAM/KMS/S3 baseline, centralized security, and
cost controls. Phase 0B.1 delivers exactly this — no Kubernetes, databases, Kafka, Redis, or
application code.

## Decision

- **Account model:** AWS Organizations with OUs `SharedServices`, `Dev`, `Staging`, `Prod`.
  Shared Services is the security/logging/backup hub (delegated admin for GuardDuty +
  Security Hub, hosts the org CloudTrail + Config aggregator + central log-archive bucket).
- **Regions:** Primary `us-east-1`, DR `us-west-2`. Each account gets non-overlapping `/16`
  VPCs in both (see `foundation/docs/cidr.md`).
- **VPC:** 3 tiers — `public` (IGW/NAT/ingress), `app` (EKS/services/workers), `data`
  (RDS/Redis/Kafka, **no NAT/IGW route**). Multi-AZ. VPC endpoints keep AWS-API traffic
  off the NAT.
- **IAM:** GitHub OIDC (no static CI keys, ADR-0011); least-privilege `terraform` role;
  MFA-gated `admin` (break-glass) and `developer`; external-id `cross_account` role for
  Shared Services; Access Analyzer (ORGANIZATION in Shared Services).
- **KMS:** customer-managed CMKs `s3`/`logs`/`backup`/`secrets`, rotation on, granting
  CloudTrail/Config.
- **S3:** `artifact` / `log` (central archive, cross-account delivery policy) / `backup`
  buckets — versioned, SSE-KMS, public-access-blocked, lifecycle-tiered. (Terraform *state*
  bucket remains the separate `bootstrap` module, ADR-0008.)
- **Security:** org CloudTrail (multi-region, validation), Config recorder + aggregator,
  GuardDuty, Security Hub (CIS + FSBP), all to the central log bucket.
- **Cost:** cost-allocation tags + monthly budget with 80%/100% alerts.

## Alternatives considered

- **Single-account / one VPC:** *Rejected* — no blast-radius isolation; prod shares fate with
  dev; harder compliance/segregation of duties.
- **Primary `ap-south-1` for latency:** *Deferred* — valid for APAC users; kept `us-east-1` to
  match existing bootstrap/state regions. Revisit per user geography.
- **Central logging via each account's own bucket:** *Rejected* — fragmented, harder to audit;
  centralized archive in Shared Services chosen.
- **Third-party security (Datadog/Wiz):** *Deferred* — AWS-native GuardDuty/Security Hub/Config
  meet the bar; add vendors later as backends.

## Consequences

- Clean blast-radius isolation; prod protected; centralized audit & cost visibility.
- More Terraform configurations to manage (4 accounts) — mitigated by the `account-baseline`
  module + per-env `.tfvars`.
- Shared Services is a dependency: apply it (and bootstrap) before Dev/Staging/Prod.
- Workloads in 0B.2+ drop into pre-built subnets, endpoints, KMS, IAM, and log bucket.

## Next milestone (Phase 0B.2)
EKS, RDS (PostgreSQL 16, ADR-0006), ElastiCache split (ADR-0005), MSK (ADR-0004) on top of
this foundation; then application delivery (Helm/Kustomize, ADR-0007) and observability
(ADR-0010).

## References
- `infrastructure/terraform/foundation/**` (modules + environments + docs)
- ADR-0008 (remote state), ADR-0011 (OIDC CI), ADR-0004/0005/0006/0007/0009/0010
- `docs/review-board-changes.md` (board-approved architecture)
