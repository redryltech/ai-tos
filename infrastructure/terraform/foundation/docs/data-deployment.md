# Data Platform Deployment Guide (Phase 0B.3)

Applies the RDS PostgreSQL 16 + split Redis (cache/state) foundation to an environment.

## Apply order
1. **Bootstrap** (`infrastructure/terraform/bootstrap`) — state bucket + lock table + KMS (once).
2. **Account baseline** — run the target account's `foundation/environments/<env>` baseline (creates
   VPC, IAM, KMS, S3, Security, Cost). For the data stack we also need the VPC `data` subnet tier.
3. **Data stack** — from `foundation/environments/data`:
   ```bash
   cd infrastructure/terraform/foundation/environments/data
   terraform init -backend-config="bucket=ai-tos-tfstate-<acct>" -backend-config="region=us-east-1"
   terraform plan  -var-file=terraform.tfvars
   terraform apply -var-file=terraform.tfvars
   ```

## Post-apply tasks (operational, not in Terraform)
- **Retrieve DB credentials:** `aws secretsmanager get-secret-value --secret-id <master_user_secret_arn>`.
- **Create per-service DB roles** (least privilege, no superuser): create a role per app, grant only
  needed schemas/tables. Never share the master user with applications.
- **Redis auth:** enable Redis AUTH (token from Secrets Manager) before apps connect; restrict SG to
  the app namespaces' node/security groups.
- **Rotation:** enable Secrets Manager automatic rotation for the RDS master secret (ADR-0009).
- **Monitoring:** wire Performance Insights + Enhanced Monitoring CloudWatch metrics into the
  observability stack (Phase 0B.4 / ADR-0010) — out of scope here.

## Notes / assumptions
- The standalone `environments/data` builds its own VPC for self-contained validation. In production the
  data modules attach to each environment's VPC (dev/staging/prod) via the `data` subnet tier.
- KMS `database` / `redis` CMKs are created by the `kms` module in this environment.
- No Kafka/MSQ, no application workloads, no External Secrets Operator (designed-for, not installed).
