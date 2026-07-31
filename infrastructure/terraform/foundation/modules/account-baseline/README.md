# account-baseline module

Single entry point for the per-account platform services. Call once per account after the
VPC is created. It composes:

- **route53** — public + private hosted zones
- **iam** — OIDC, terraform/admin/developer/cross-account roles, Access Analyzer
- **kms** — `s3`/`logs`/`backup`/`secrets` CMKs (grants CloudTrail/Config)
- **s3** — artifact / log / backup buckets
- **security** — CloudTrail, Config, GuardDuty, Security Hub
- **cost** — cost-allocation tags + monthly budget

The **Shared Services** account sets `is_aggregator = true` and `is_log_archive = true` to
centralize the org trail, Config aggregator, Security Hub, and log archive. Other accounts
pass `central_log_bucket_name` (from Shared Services) so their trails/config write centrally.
