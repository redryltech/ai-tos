# GitHub Environments (Phase 0B.7 / ADR-0011)

Configure in **Settings → Environments**. Workflows reference these names exactly.

| Environment | Required reviewers | Deployment branches | Used by |
|---|---|---|---|
| `staging` | ≥1 CODEOWNER | `main` only | Terraform apply, deploy smoke |
| `production` | ≥2 CODEOWNERS | `main` only | Terraform apply, deploy smoke, release promote |

## Required repository variables

| Variable | Purpose |
|---|---|
| `AWS_REGION` | OIDC AWS region |
| `TF_STATE_BUCKET` | Terraform remote state bucket |
| `ECR_REGISTRY` | ECR registry host |
| `SMOKE_BASE_URL` | Web base URL for smoke |
| `SMOKE_API_URL` | API base URL for smoke |
| `SMOKE_AI_URL` | AI service base URL for smoke |

## Required secrets

| Secret | Purpose |
|---|---|
| `AWS_ROLE_ARN` | OIDC role for CI plan/apply/push (no static keys) |

## Protection rules (manual in GitHub UI)

1. Create environments `staging` and `production`.
2. Enable **Required reviewers** on both; production must wait for staging apply.
3. Restrict deployment branches to `main`.
4. Enable **Prevent self-review** on production where available.
