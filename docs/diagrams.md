# Architecture Diagram Index

**AI-TOS · Phase 0A foundation (post Review Board changes) · 2026-07-30**
Diagrams are [Mermaid](https://mermaid.js.org) and render in GitHub/most Markdown viewers.
They reflect the **decisions** in ADRs 0004–0012 (architecture only; no Phase 0B provisioning).

## Index

| ID | Diagram | Covers | ADR |
|---|---|---|---|
| D1 | System context & layers | overall topology | plan/0004–0012 |
| D2 | Event backbone (Kafka + Outbox + DLQ) | Priority 1 | 0004 |
| D3 | Redis role separation | Priority 2 | 0005 |
| D4 | Data tier (RDS PostgreSQL + future TS) | Priority 3 | 0006 |
| D5 | Secrets flow (SM + KMS + ESO + IRSA) | Priority 6 | 0009 |
| D6 | Observability pipeline | Priority 7 | 0010 |
| D7 | CI/CD pipeline (OIDC + scanning + gated TF) | Priority 8 | 0011 |
| D8 | K8s delivery (Helm + Kustomize + Argo CD) | Priority 4 | 0007 |
| D9 | Testing pyramid | Priority 9 | 0012 |

---

### D1 — System context & layers
```mermaid
flowchart TB
  U[User / Trader] -->|HTTPS| ALB[ALB + Ingress NGINX]
  ALB --> WEB[web · Next.js]
  ALB --> API[api · NestJS]
  ALB --> AI[ai-service · FastAPI]
  API --> PG[(RDS PostgreSQL 16)]
  API --> RC[(redis-cache)]
  API --> RS[(redis-state)]
  API --> KAF[Apache Kafka / MSK]
  AI --> KAF
  WK[Go workers: market / risk / news / scheduler] --> KAF
  WK --> PG
  WK --> RS
  OBS[OTel Collector] -.traces/metrics/logs.-> PG & API & AI & WK
  OBS --> PROM[Prometheus] & LOKI[Loki] & TEMP[Tempo]
  PROM & LOKI & TEMP --> GRAF[Grafana + Alertmanager]
  ESO[External Secrets Operator] -->|sync| SM[(Secrets Manager + KMS)]
  API & AI & WK -.secrets.-> ESO
```

### D2 — Event backbone (Kafka + Outbox + DLQ)
```mermaid
sequenceDiagram
  participant S as Service (API/Worker)
  participant DB as PostgreSQL (_outbox)
  participant R as Outbox Relay (Debezium)
  participant K as Kafka (MSK)
  participant C as Consumer
  participant D as DLQ Topic
  S->>DB: BEGIN; write state + event to _outbox; COMMIT
  R->>DB: poll _outbox (CDC)
  R->>K: publish event (partition by key)
  K->>C: consume (consumer group, offset)
  alt success
    C->>C: idempotent handle (dedup key)
  else retry exhausted / poison
    C->>D: route to DLQ
  end
  Note over K: Schema Registry validates every event
```

### D3 — Redis role separation
```mermaid
flowchart LR
  subgraph volatile[redis-cache cluster · allkeys-lru · no persistence]
    C1[App cache]
    C2[Computed indicators]
    C3[Semantic LLM cache]
    C4[Ephemeral pub/sub · WS fan-out]
  end
  subgraph state[redis-state cluster · AOF · sessions noeviction]
    S1[User sessions]
    S2[Rate-limit counters]
  end
  API[api] --> C1 & C2 & C3 & C4
  API --> S1 & S2
  WK[workers] --> S1 & S2
  WS[ws/scheduler] --> C4
  KAF[Kafka] -.bus, not Redis.-> API
```

### D4 — Data tier
```mermaid
flowchart TB
  APP[Services] --> PG[(RDS PostgreSQL 16 · primary OLTP<br/>Multi-AZ · KMS · PITR)]
  PG --> REP[(Read replica · portfolio/analytics)]
  REP --> RM[(CQRS read models · compute-on-write)]
  RM --> RC[(redis-cache · read cache)]
  Note over APP,RC: Phase 2+ : dedicated TS[(RDS + timescaledb)<br/>market ticks/candles] fed by logical replication
  Note right of PG: Aurora = future path only<br/>TimescaleDB ≠ primary
```

### D5 — Secrets flow
```mermaid
flowchart TB
  DEV[Developer / CI OIDC] -->|assume role| SM[(AWS Secrets Manager)]
  SM --> KMS[(KMS CMK · dedicated)]
  SM -->|automatic rotation 30-90d| LAM[Rotation Lambda]
  ESO[External Secrets Operator<br/>IRSA / OIDC] -->|GetSecretValue (scoped ARN)| SM
  ESO -->|sync| KS[Kubernetes Secret / pod env]
  API[api] --> KS
  AI[ai-service] --> KS
  WK[workers] --> KS
  Note: static k8s Secret deleted; no secret in git/manifests
```

### D6 — Observability pipeline
```mermaid
flowchart LR
  SVC[All services · OTel SDK] -->|OTLP| COLL[OTel Collector<br/>DaemonSet + Gateway]
  COLL --> PROM[Prometheus / AMP · metrics]
  COLL --> LOKI[Loki · logs]
  COLL --> TEMP[Tempo / X-Ray · traces]
  PROM --> GRAF[Grafana dashboards]
  LOKI --> GRAF
  TEMP --> GRAF
  PROM --> AM[Alertmanager · severity tiers]
  AM --> OPS[PagerDuty / Opsgenie]
```

### D7 — CI/CD pipeline
```mermaid
flowchart TB
  PR[Pull Request] --> OIDC[GitHub OIDC → AWS role]
  PR --> LINT[Lint / Typecheck / Build]
  PR --> SCAN[SAST · dep · image (Trivy) · IaC · SBOM · Cosign sign]
  PR --> CT[Contract + Health tests]
  PR --> TFPLAN[terraform plan · OIDC · comment]
  PR -->|approve| MAIN[(main)]
  MAIN --> REL[Semantic Release + push ECR]
  MAIN --> TFAPPLY[terraform apply · protected env · required reviewers]
  TFAPPLY --> AWS[(AWS infra)]
  REL --> ARGO[Argo CD sync · Kustomize overlay]
  ARGO --> K8S[(EKS)]
```

### D8 — K8s delivery (Helm + Kustomize + Argo CD)
```mermaid
flowchart TB
  GIT[Git repo] --> HELM[helm/ai-tos chart · templates]
  GIT --> BASE[kustomize/base]
  BASE --> DEV[kustomize/overlays/dev]
  BASE --> STG[kustomize/overlays/staging]
  BASE --> PRD[kustomize/overlays/prod · + add-ons]
  PRD --> ESO[External Secrets Operator]
  PRD --> ING[Ingress NGINX + Cert-Manager]
  PRD --> MON[Prometheus / Grafana / OTel]
  DEV & STG & PRD --> ARGO[Argo CD · app-of-apps]
  ARGO --> K8S[(EKS cluster)]
  LEG[legacy/ raw YAML] -.reference only, not applied.-> K8S
```

### D9 — Testing pyramid
```mermaid
flowchart BT
  CHA[Chaos · Litmus/Chaos Mesh · staging · Phase 2+] --> PERF[Performance · k6/Artillery · Phase 1+]
  PERF --> SMOKE[Smoke · post-deploy · Phase 0B]
  SMOKE --> INT[Integration · Testcontainers PG+Kafka · Phase 1+]
  INT --> CONT[Contract · OpenAPI + Schema Registry + shared types · Phase 0A]
  CONT --> HEALTH[Health · /health per service · CI + post-deploy · Phase 0A]
```

---
*Diagrams are architecture-only. No trading, market, or AI decision logic is depicted.
Phase assignments follow ADRs 0004–0012 and the readiness report.*
