# ADR-0005: Redis role separation

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; provisioning in Phase 0B)

## Context

The Phase 0A scaffold used a single ElastiCache cluster for cache, event streams,
sessions, and rate limiting. The Architecture Review Board flagged this as a single point
of failure: a Redis eviction storm, failover, or outage would simultaneously take down
caching, the event bus, user sessions, and rate limiting. With Kafka now owning the
durable event log (ADR-0004), Redis must be re-scoped to stateless/volatile and
stateful/security-sensitive roles on **separate physical clusters**.

## Decision

Provision **at least two** Redis clusters (ElastiCache for Redis, with replica +
multi-AZ). Logical databases are not sufficient isolation for the security-sensitive
roles; separate clusters are required.

### `redis-cache` (volatile, data-plane)
- **Responsibility:** application cache, computed indicators, semantic LLM response cache,
  ephemeral in-cluster pub/sub (e.g. WebSocket fan-out by symbol).
- **Policy:** `maxmemory-policy allkeys-lru`; **no persistence** (AOF/RDB off).
- **Failure mode:** losing this cluster degrades latency only; correctness is unaffected.

### `redis-state` (durable-ish, security-plane)
- **Responsibility:** user **sessions** and **rate-limiting** counters/token buckets.
- **Policy:** AOF enabled; `maxmemory-policy noeviction` for session keys (sessions must
  not be silently dropped); rate-limit keys carry their own TTL.
- **Failure mode:** losing this cluster logs users out and resets limits — annoying but
  not data-corrupting. Isolated from `redis-cache`, so a cache storm cannot evict sessions.

### Streams role — **retired**
- The durable event/stream role is **removed** from Redis. Apache Kafka (ADR-0004) is the
  backbone. Redis pub/sub is retained **only** for ephemeral, non-durable in-cluster
  signaling and lives in `redis-cache`.

## Environment variables (contract)
```
REDIS_CACHE_URL=redis://ai-tos-cache:6379      # volatile cache + ephemeral pub/sub
REDIS_STATE_URL=redis://ai-tos-state:6379      # sessions + rate limiting
```
(Legacy single `REDIS_URL` is deprecated; removed from all ConfigMaps/`.env`.)

## Alternatives considered

- **Single shared cluster** — *Rejected* (board-flagged SPOF; coupling of cache eviction
  with session/limit state).
- **Logical DBs on one cluster** — *Rejected* for security roles; a cluster-level event
  (failover, OOM, network partition) still affects all tenants.
- **Managed Valkey** — *Acceptable alternative* (Redis OSS fork); evaluate for cost in
  Phase 0B, same topology applies.

## Consequences

- No single Redis failure takes down sessions + cache + bus together.
- Slightly higher cost (two clusters) and two connection pools in services.
- Clear ownership and blast-radius boundaries per cluster.
- `@ai-tos/config` and `@ai-tos/database`/SDK must adopt the two-URL contract.

## References

- ADR-0004 (Kafka owns streams), `docs/review-board-changes.md` Priority 2,
  `docs/env-vars.md`.
