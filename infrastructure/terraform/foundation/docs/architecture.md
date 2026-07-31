# Cloud Foundation Architecture (Phase 0B.1)

## Region strategy
- **Primary: `us-east-1`** (us-east-1a/b/c). Mature, lowest-latency to most US/EU users,
  broadest service availability for the later EKS/Kafka/RDS stack.
- **DR: `us-west-2`**. Geographically distant from primary; paired for RTO/RPO.
- **Rationale:** given AI-TOS's India base, `ap-south-1` (Mumbai) + `ap-southeast-1`
  (Singapore) is a strong alternative for latency; the team standardized on `us-east-1`/
  `us-west-2` to match existing bootstrap/state-bucket regions. Revisit if user-geography
  demands sub-100ms APAC latency (then primary=`ap-south-1`, DR=`ap-southeast-1`).
- **Isolation:** each account gets its own primary + DR `/16` (see `cidr.md`), never overlapping.

## Defense in depth
- **Network:** 3-tier subnets; data tier has **no route to NAT/IGW**; NACLs + default-deny SGs.
- **Identity:** OIDC (no static CI keys), MFA-gated break-glass, external-id cross-account,
  Access Analyzer (org-wide in Shared Services).
- **Data:** SSE-KMS on every bucket; CMK rotation; public-access-blocked; versioned; lifecycle-tiered.
- **Audit:** org CloudTrail (multi-region, validation on), Config recorder + aggregator,
  GuardDuty, Security Hub (CIS + FSBP), all to a central log-archive bucket.
- **Cost:** cost-allocation tags + monthly budget alerts.

## Trust boundaries
- **Management account** owns Organizations only (no workloads).
- **Shared Services** centralizes security/logging/backups (acts as Security/Audit hub).
- **Dev/Staging/Prod** are workload accounts; Prod is protected (required reviewers via CI,
  per ADR-0011).

## What this enables next (Phase 0B.2+)
- EKS, RDS (PostgreSQL 16), ElastiCache (split), MSK (Kafka) land in the **app** / **data**
  subnets, consuming the VPC endpoints, KMS keys, IAM roles, and log bucket already provisioned.
- CI (ADR-0011 OIDC) assumes `ai-tos-<env>-terraform` to manage each account.
