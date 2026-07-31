# Deployment Guide

## Environments
- `dev` (small EKS), `staging` (full parity), `prod` (EKS multi-AZ). Promotion is a git
  change to a Kustomize overlay, reconciled by Argo CD (ADR-0007).

## Build images
```bash
# Phase 0B (release.yml does this via OIDC + ECR):
docker build -f infrastructure/docker/Dockerfile.api -t ai-tos/api:$(git rev-parse --short HEAD) .
docker build -f infrastructure/docker/Dockerfile.web -t ai-tos/web:$(git rev-parse --short HEAD) .
docker build -f infrastructure/docker/Dockerfile.ai-service -t ai-tos/ai-service:$(git rev-parse --short HEAD) .
docker build --build-arg WORKER=market-worker -f infrastructure/docker/Dockerfile.go -t ai-tos/market-worker:$(git rev-parse --short HEAD) .
# ... repeat per worker
```

## Provision infra (Terraform, ADR-0008)
Remote state (S3 + DynamoDB) is enabled in `main.tf`. The bootstrap bucket/table/KMS live in
`infrastructure/terraform/bootstrap` (applied once). Then:
```bash
cd infrastructure/terraform
terraform init -reconfigure \
  -backend-config="bucket=ai-tos-tfstate-<account_id>" \
  -backend-config="region=us-east-1"
terraform plan -var="environment=dev"
terraform apply
```
`terraform plan` runs on every PR (OIDC, commented); `apply` runs only on `main` via a
protected `production` environment with required reviewers (ADR-0011).

## Deploy to K8s (Helm + Kustomize + Argo CD, ADR-0007)
Raw `kubectl apply -f` manifests are retired (see `infrastructure/kubernetes/legacy/`).
```bash
# Preview a rendered overlay
kustomize build --enable-helm infrastructure/kubernetes/kustomize/overlays/dev

# Apply (or let Argo CD reconcile from git)
kubectl apply -k infrastructure/kubernetes/kustomize/overlays/dev
```
Cluster add-ons (External Secrets Operator + `ClusterSecretStore aws-secrets-manager`,
Ingress NGINX, Cert-Manager, Metrics Server/Prometheus) are installed once per cluster
(via Argo CD app-of-apps), not per overlay — see `infrastructure/kubernetes/kustomize/README.md`.

## CI/CD
- `ci.yml`: lint/typecheck/build/contract+health tests on every PR.
- `security.yml`: SAST (CodeQL), deps (npm/pip/govulncheck), IaC + image scan (Trivy), SBOM.
- `release.yml`: semantic-release on `main`; OIDC → ECR; images built & pushed.
- `terraform.yml`: plan (PR) + gated apply (main, protected env).
All cloud auth is **OIDC** — no static keys (ADR-0011).
