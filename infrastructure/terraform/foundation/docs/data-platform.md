# Data Platform Architecture — Diagrams (Phase 0B.3)

Mermaid diagrams for the AI-TOS data foundation. No Kafka/MSQ/event streaming here (ADR-0004).

## D1 — Data platform overview
```mermaid
flowchart TB
  subgraph VPC["VPC — private subnets"]
    subgraph DATA["data tier"]
      RDS[(RDS PostgreSQL 16\nMulti-AZ, KMS, PITR)]
      REP[(Read Replica)]
    end
    subgraph APP["app tier"]
      RC[(Redis Cache\nLRU, no persist)]
      RS[(Redis State\nAOF, noeviction)]
    end
  end
  RDS -->|read replica| REP
  APP -->|cache/state| APP
  SEC[Secrets Manager\nmaster password] -->|inject| RDS
  KMS[KMS CMK] --> RDS & RC & RS
```

## D2 — RDS High Availability & backups
```mermaid
flowchart LR
  W[Writer\nAZ-a] -->|sync| S[Standby\nAZ-b]
  W -->|binlog| REP[Read Replica\nAZ-c]
  W -->|automated backup| S3[(Backup bucket\nPITR 14d)]
  S -->|automated backup| S3
  REP -->|snapshot| S3
  F[Failover] --> S
```

## D3 — Redis topology (split per ADR-0005)
```mermaid
flowchart TB
  subgraph CACHE["Redis Cache (volatile)"]
    C1[Primary] -->|failover| C2[Replica]
    C1 -. allkeys-lru .-> EV[(evict)]
  end
  subgraph STATE["Redis State (durable)"]
    S1[Primary] -->|failover| S2[Replica]
    S1 -. AOF + noeviction .-> P[(persist sessions)]
  end
```
- **Cache:** `allkeys-lru`, `snapshot_retention_limit=0` (disposable).
- **State:** `noeviction` + AOF (`appendonly=yes`), 1 snapshot (sessions survive recycle).

## D4 — Backup / DR architecture
```mermaid
flowchart TB
  RDS[(RDS)] -->|PITR + snapshots| BK[S3 backup bucket\nKMS, lifecycle]
  BK -->|cross-region CRR| DRB[S3 DR bucket\nus-west-2]
  RDS -->|Multi-AZ standby| SAZ[Standby AZ]
  RC & RS -->|AOF/snapshot| BK
  RTO[Target RTO < 15m] & RPO[Target RPO < 5m] --> BK
```

## D5 — Security
```mermaid
flowchart TB
  APP[Apps / Services] -->|TLS 1.2+| RDS
  APP -->|TLS| RC & RS
  SG[Security Groups\n5432 / 6379 only] --> RDS & RC & RS
  KMS[KMS CMK] -->|encrypt at rest| RDS & RC & RS
  SM[Secrets Manager\nmanaged master pwd + rotation] --> RDS
  IAM[IAM auth\n+ least-privilege roles] --> RDS
  CLOUDTRAIL[CloudTrail + RDS logs\n(central log bucket)] --> AUDIT[(Shared Services audit)]
```
