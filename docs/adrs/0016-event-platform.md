# ADR-0016: Event Platform (Phase 0B.4)

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** Principal Event-Driven / Platform Engineering
- **Phase:** 0B.4 (event infrastructure only — no producers/consumers/outbox)

## Context

Phases 0B.1–0B.3 delivered landing zone, EKS, and the data platform. ADR-0004 selected Kafka on
Amazon MSK as the event backbone (rejecting Redis Streams). We now provision the MSK foundation,
topic/DLQ strategy, schema registry approach, and event security — without implementing any
producers, consumers, or application/business events.

## Decision

- **Amazon MSK (Kafka 3.6):** provisioned cluster, `broker_count` >= 3 across 3 AZs, `kafka.m5.large`
  (default), 1 TiB EBS/broker, KMS at rest, TLS in transit (`client_broker=TLS`, `in_cluster=true`).
- **High availability:** Multi-AZ brokers with RF=3, `min.insync.replicas=2`; failover is automatic.
- **Authentication:** **IAM** for clients (least privilege, SigV4, no static creds) + **SCRAM** for
  platform tooling (topic management). Broker config: `auto.create.topics.enable=false`.
- **Topic strategy:** `<domain>.<entity>.<event>` naming (`market/portfolio/risk/audit/notification/
  system`); each domain has `.events`, `.dlq`, `.retry`; partitions 3–12 by throughput; RF=3;
  retention 7–14d events, 30–365d DLQs, 90d audit; `cleanup.policy=delete` (compact optional for keyed
  state topics). Managed as code via the Kafka provider.
- **DLQ/retry:** per-domain `.dlq` + `.retry` topics; consumers (0B.5) redeliver with backoff from
  `.retry`, route poison messages to `.dlq`, and replay from `.dlq`.
- **Schema Registry:** **AWS Glue Schema Registry** (native, MSK-integrated) with **Avro** payloads,
  **BACKWARD** compatibility by default (per-topic override allowed), CI-enforced schema governance.
  Avro chosen over Protobuf (gRPC/strong-typing) and JSON Schema (human-readable, larger). No
  application schemas are defined in this phase.
- **Security:** IAM access control + topic-scoped ACLs, SG-restricted 9094/9096, KMS, CloudWatch broker
  logs to central audit. An unattached client IAM policy is provided for 0B.5 role binding.
- **Networking:** brokers in private subnets, VPC-internal bootstrap DNS, cross-AZ replication.

## Alternatives considered
- **Amazon MSK Serverless:** *Rejected* for the primary — less control over broker sizing/partitions and
  throughput ceilings; provisioned fits a trading-grade event backbone.
- **Confluent Cloud / self-managed Kafka:** *Rejected* — MSK is AWS-native, less ops, integrates with
  IAM/KMS/CloudWatch.
- **Redis Streams:** *Rejected* earlier (ADR-0004) — weaker ordering/replay/scale; Redis is cache/state.
- **Protobuf/JSON Schema registry:** *Deferred* — Avro on Glue is the default; Protobuf viable later for
  gRPC-typed payloads.

## Consequences
- Secure, Multi-AZ, IAM-authenticated Kafka foundation ready for producers/consumers in 0B.5.
- Topic surface + DLQ/retry convention established; schemas governed via Glue + CI.
- No application identities, producers, consumers, or Outbox yet (by scope).

## Next milestone (Phase 0B.5)
Producers/consumers, Outbox relay (ADR-0004), External Secrets Operator wiring, schema registration in
Glue, and the observability stack (ADR-0010) for broker/consumer metrics.

## References
- `infrastructure/terraform/foundation/modules/msk`, `kafka-topics`
- `infrastructure/terraform/foundation/environments/event`
- `infrastructure/terraform/foundation/docs/event-platform.md`
- ADRs 0004 (Kafka backbone), 0009 (Secrets), 0010 (observability)
