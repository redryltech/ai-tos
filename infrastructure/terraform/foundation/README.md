# AI-TOS — AWS Cloud Foundation (Phase 0B.1)

The platform foundation all future infrastructure runs on. **Platform only** — no EKS/Kubernetes,
no databases, no Kafka/Redis, no application or AI code (those are later phases).

## Scope (Phase 0B.1)
1. **Account structure** — AWS Organizations: `SharedServices`, `Dev`, `Staging`, `Prod`.
2. **Region strategy** — Primary `us-east-1`, DR `us-west-2` (rationale in `docs/architecture.md`).
3. **VPC** — 3-tier subnets (public / private-app / private-data), multi-AZ, IGW, NAT, endpoints.
4. **Networking** — security groups, NACLs, Route53 (public + private zones).
5. **IAM** — OIDC (GitHub Actions), least-privilege roles, cross-account, Access Analyzer.
6. **KMS** — customer-managed CMKs (s3/logs/backup/secrets).
7. **S3** — artifact / log-archive / backup buckets (state bucket is separate, see `../bootstrap`).
8. **Cost** — cost-allocation tags + monthly budget.
9. **Security** — CloudTrail, AWS Config, GuardDuty, Security Hub, IAM Access Analyzer.
10. **Docs** — `docs/cidr.md`, `docs/network-diagram.md`, `docs/architecture.md`, ADR-0013.

## Layout
```
foundation/
├── modules/
│   ├── organizations/   # OUs + accounts + guardrail SCP + delegated admin (mgmt account)
│   ├── account-baseline/ # composes route53+iam+kms+s3+security+cost per account
│   ├── vpc/              # 3-tier VPC (terraform-aws-modules/vpc)
│   ├── vpc-endpoints/    # S3/DDB gateway + KMS/Logs/ECR/STS/SM/SSM interface endpoints
│   ├── nacls/            # subnet NACLs (public/app/data)
│   ├── security-groups/  # endpoints SG + management SG (default-deny)
│   ├── route53/          # public + private hosted zones
│   ├── iam/              # OIDC, terraform/admin/developer/cross-account roles, Access Analyzer
│   ├── kms/              # CMKs per purpose
│   ├── s3/               # artifact / log / backup buckets
│   ├── security/         # CloudTrail, Config, GuardDuty, Security Hub
│   ├── cost/             # cost-allocation tags + budget
│   ├── eks/              # EKS cluster + managed node groups + IRSA + add-on IAM (Phase 0B.2)
│   ├── rds-postgresql/   # PostgreSQL 16 platform (Multi-AZ, PITR, KMS, Secrets Mgr) (Phase 0B.3)
│   ├── redis-cache/      # volatile cache tier, LRU, no persistence (Phase 0B.3)
│   ├── redis-state/      # durable state tier, AOF, noeviction (Phase 0B.3)
│   ├── msk/              # Amazon MSK (Kafka 3.6, Multi-AZ, IAM+SCRAM, KMS, TLS) (Phase 0B.4)
│   ├── kafka-topics/     # topic surface as code via Kafka provider (Phase 0B.4)
│   └── observability/    # AMP + IRSA for Prometheus/OTel/Grafana (Phase 0B.6)
├── environments/
│   ├── shared-services/  # is_aggregator=true, is_log_archive=true
│   ├── dev/  staging/  prod/  # members (central logging to Shared Services)
│   ├── eks/              # Phase 0B.2: VPC + EKS platform (self-contained example)
│   ├── data/             # Phase 0B.3: VPC + KMS + RDS + Redis cache/state (self-contained example)
│   ├── event/            # Phase 0B.4: VPC + KMS + MSK + topics (self-contained example)
│   └── observability/    # Phase 0B.6: AMP workspace + observability IRSA
└── docs/                 # cidr.md, network-diagram.md, architecture.md, eks-architecture.md, data-platform.md, event-platform.md
```

## Apply order
1. **Management account**: `organizations` module → creates OUs/accounts + delegated admin.
2. **Bootstrap** (`../bootstrap`): create the Terraform state bucket + lock table + KMS (once).
3. **Per account** (Shared Services first, then Dev/Staging/Prod):
   ```bash
   cd environments/<account>
   terraform init -backend-config="bucket=ai-tos-tfstate-<acct>" -backend-config="region=us-east-1"
   terraform plan -var-file=terraform.tfvars
   terraform apply
   ```
   Shared Services must be applied first (it owns the log-archive bucket + org trail that
   the other accounts point at).

## Explicitly NOT in scope (Phase 0B.1)
EKS, Kubernetes/Helm, RDS/Redis/Kafka, monitoring stack, CI/CD changes, application/AI code.
These are provisioned in later milestones (see ADR-0013 → Next milestone 0B.2).
