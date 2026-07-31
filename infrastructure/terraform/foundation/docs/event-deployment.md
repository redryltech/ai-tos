# Event Platform Deployment Guide (Phase 0B.4)

Applies the Amazon MSK cluster + topic surface + schema registry design.

## Apply order
1. **Bootstrap** + **account baseline** (foundation) — state, VPC, IAM, KMS, S3, Security, Cost.
2. **Event stack** — from `foundation/environments/event`:
   ```bash
   cd infrastructure/terraform/foundation/environments/event
   terraform init -backend-config="bucket=ai-tos-tfstate-<acct>" -backend-config="region=us-east-1"
   terraform plan  -var-file=terraform.tfvars
   terraform apply -var-file=terraform.tfvars
   ```
   This creates the MSK cluster, SCRAM secret (Secrets Manager), CloudWatch broker log group,
   the unattached client IAM policy, and the topic surface (via the Kafka provider + SCRAM).

## Post-apply tasks (operational, not in Terraform)
- **Retrieve SCRAM creds:** `aws secretsmanager get-secret-value --secret-id <scram-secret-arn>`
  (used by the Kafka provider / platform tooling; apps use IAM, not SCRAM).
- **Schema Registry:** provision the **Glue Schema Registry** (design in `event-platform.md` D4);
  CI validates schemas and registers versions (0B.5).
- **Client IAM:** attach the `*-kafka-client` policy to the app/role identities (0B.5) for
  least-privilege topic access.
- **DLQ/replay:** implement consumer-side retry/backoff + `.dlq` routing (0B.5).

## Notes / assumptions
- The standalone `environments/event` builds its own VPC for self-contained validation; in production
  the MSK module attaches to each environment VPC (private subnets).
- `kafka_version=3.6.0`; bump deliberately for upgrades.
- No producers/consumers, no Outbox, no monitoring stack in this phase.
