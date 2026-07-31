# Security module

- **CloudTrail** — multi-region, org-wide when `is_aggregator` (shared-services), log-file
  validation on, KMS-encrypted, delivered to the central log bucket.
- **AWS Config** — recorder (all resources, global types) + delivery channel to the log
  bucket. Aggregator (`organization_aggregation`) only in the aggregator account.
- **GuardDuty** — detector enabled (S3 logs on). Members auto-enroll via the delegated admin.
- **Security Hub** — account enabled + CIS + AWS Foundational best-practices standards.

Centralization: shared-services = delegated admin (set in the Organizations module) + hosts
the org trail, Config aggregator, and Security Hub aggregator.
