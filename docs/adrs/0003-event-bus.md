# ADR-0003: Event bus + Outbox (future)

## Status
**Superseded by ADR-0004** (final event backbone = Apache Kafka on MSK).

## Context
Trading workflows are asynchronous and span many engines/agents. A naive synchronous call
chain won't scale and risks lost events. Phase 0A left the specific backbone open.

## Decision (historical)
Adopt an event backbone (Kafka or Redis Streams) with a Schema Registry and an Outbox
pattern; consumers idempotent; poison messages to a DLQ.

## Supersession
The final decision is recorded in **ADR-0004**: Apache Kafka (MSK) is the backbone;
Redis Streams role is retired in favor of Kafka; Redis roles are split per ADR-0005.
