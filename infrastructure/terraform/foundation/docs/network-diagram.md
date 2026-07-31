# Network & Architecture Diagrams (Phase 0B.1)

Mermaid diagrams for the AI-TOS cloud foundation.

## N1 — Account / Org structure
```mermaid
flowchart TB
  MGMT[Management Account] --> ORG[Organizations]
  ORG --> OU_SS[OU: SharedServices]
  ORG --> OU_DEV[OU: Dev]
  ORG --> OU_STG[OU: Staging]
  ORG --> OU_PRD[OU: Prod]
  OU_SS --> AC_SS[ai-tos-shared-services]
  OU_DEV --> AC_DEV[ai-tos-dev]
  OU_STG --> AC_STG[ai-tos-staging]
  OU_PRD --> AC_PRD[ai-tos-prod]
  AC_SS -. delegated admin .-> GD[GuardDuty] & SH[Security Hub]
  G[Guardrail SCP: deny root creds, restrict regions] --> ORG
```

## N2 — VPC tiers & routing
```mermaid
flowchart TB
  IGW[Internet Gateway] -->|0.0.0.0/0| PUB[Public subnets /20 x3]
  PUB --> NAT[NAT GW x AZ]
  NAT -->|0.0.0.0/0| APP[App subnets /20 x3\nEKS, services, workers]
  APP -->|5432/6379/9092\nVPC only| DATA[Data subnets /20 x3\nRDS, ElastiCache, MSK]
  APP --> VPCE[VPC Endpoints\nS3/DDB gw + KMS/Logs/ECR/STS/SM/SSM iface]
  DATA -. no NAT/IGW route .-> APP
```

## N3 — Centralized logging & security
```mermaid
flowchart LR
  DEV[Dev acct] -->|trail/config| LOG[(Shared Services\nlog-archive bucket)]
  STG[Staging acct] -->|trail/config| LOG
  PRD[Prod acct] -->|trail/config| LOG
  LOG --> CT[CloudTrail org trail]
  LOG --> CFG[Config aggregator]
  SS[Shared Services] --> SH[Security Hub]
  SS --> GD[GuardDuty]
  SS --> AA[IAM Access Analyzer ORG]
```

## N4 — Region strategy (primary + DR)
```mermaid
flowchart TB
  P[Primary us-east-1\nVPC 10.x.0.0/16] -->|state bucket CRR\nRDS PITR + cross-region| D[DR us-west-2\nVPC 10.x0.0.0/16]
  P --> R53[Route53 health checks / failover]
```

## N5 — IAM / OIDC access
```mermaid
flowchart TB
  GH[GitHub Actions] -->|OIDC| TFROLE[ai-tos-<env>-terraform]
  TFROLE -->|scoped plan/apply| ACCT[(Account resources)]
  SSACCT[Shared Services] -->|AssumeRole + external-id| XR[ai-tos-<env>-shared-services]
  HUMAN[IAM Identity Center] --> DEVROLE[ai-tos-<env>-developer / admin MFA]
```
