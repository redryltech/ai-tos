# ADR-0004: Event backbone — Apache Kafka (MSK)

- **Status:** Accepted (supersedes ADR-0003)
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; provisioning in Phase 0B)

## Context

AI-TOS is an event-driven, money-correct platform. Domain events (orders, fills, market
data, risk signals, agent outputs) must flow between services durably, in order, and be
replayable. ADR-0003 left this "Kafka or Redis Streams, decide later." The Architecture
Review Board (verdict: ⚠ APPROVED WITH CHANGES, Priority 1) requires a single, final
backbone choice before Phase 0B.

This decision also forces the Redis role split (ADR-0005): once Kafka owns the durable
event log, Redis is no longer the bus.

## Decision

Adopt **Apache Kafka** as the system event backbone, delivered as **Amazon MSK** (managed)
with **Redpanda** as the documented drop-in alternative if cost/ops favor a
self-managed, Kafka-API-compatible engine.

Mandatory companion patterns (enforced in Phase 1+):
- **Schema Registry** (AWS Glue Schema Registry or Confluent-compatible) — every event
  type is a versioned, registered schema; producers/consumers are compatibility-checked.
- **Transactional Outbox** — services write state + event to the same DB transaction in an
  `_outbox` table; a relay (Debezium or a polling publisher) emits to Kafka. No
  dual-write.
- **Consumer idempotency** — consumers are idempotent on a dedup key; retries are safe.
- **Dead-Letter Topics (DLQ)** — poison/retry-exhausted messages land on a per-topic DLQ
  for inspection and replay.

Topic/partitioning convention: partition by aggregate key (e.g. `symbol` for market data,
`user_id`/`tenant_id` for domain events) to guarantee per-key ordering and horizontal
scale. Retention: 7–30 days online, infinite/object-store offload for replay.

## Alternatives considered

- **Redis Streams** — *Rejected.* Redis is retained (ADR-0005) but only for cache,
  sessions, and rate limiting. Using it as the durable bus would (a) re-couple the bus to
  the cache instance, recreating the exact SPOF the board flagged; (b) lack mature,
  enterprise-grade schema governance and independent consumer-group offsets; (c) have
  weaker durability/retention and replay semantics at scale; (d) make multi-region
  replication and exactly-once-ish processing harder.
- **NATS JetStream** — *Rejected as primary (kept as fallback).* Excellent performance and
  a clean Go-native story, but smaller enterprise AWS footprint, no first-class AWS-managed
  offering (self-operated), and a less ubiquitous schema-registry ecosystem than Kafka.
  Strong candidate if we later want a lightweight internal pub/sub for ephemeral signals.
- **RabbitMQ** — *Rejected.* Queue-centric, weaker at high-throughput log/event streaming,
  replay, and per-key partitioning than Kafka.

## Consequences

- Durable, ordered, replayable, money-correct event flow with governance.
- Operational maturity: MSK handles brokers, storage, patching, multi-AZ.
- Adds an operational surface (brokers, schema registry, outbox relay) — justified by the
  event-driven spine.
- Outbox + idempotency + DLQ become first-class engineering requirements.
- Redis is freed from the "stream" role (see ADR-0005).

## References

- ADR-0003 (superseded), ADR-0005 (Redis split), ADR-0009 (secrets for broker creds),
  `docs/review-board-changes.md` Priority 1.
