# S3 module

Creates the platform buckets (the **Terraform state bucket is separate** — see
`infrastructure/terraform/bootstrap`):

- **`artifact`** — CI build artifacts, Helm charts, SBOMs (KMS `s3`, 90d expire).
- **`log`** — centralized log archive (KMS `logs`, Glacier @30d, 365d expire). When
  `is_log_archive=true`, gets a bucket policy allowing org-wide CloudTrail/Config delivery.
- **`backup`** — AWS Backup vault targets (KMS `backup`, Glacier @30d, 400d expire).

All: versioned, SSE-KMS, public-access-blocked, server-access-logged, lifecycle-tiered.
