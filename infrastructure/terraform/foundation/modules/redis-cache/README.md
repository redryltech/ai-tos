# Redis Cache module (Phase 0B.3 / ADR-0005)

Volatile **cache** tier: application cache, short-lived data, computed indicators, semantic-LLM
cache, ephemeral pub/sub.

- **Eviction:** `allkeys-lru` — evict when full; cache misses are safe by design.
- **Persistence:** **none** (`snapshot_retention_limit = 0`) — data is disposable.
- **HA:** multi-AZ, automatic failover, `num_cache_clusters = 2` (primary + replica).
- **Security:** in private subnets, SG-restricted, TLS + KMS encryption at rest.
- **Out of scope:** Redis Streams are NOT used for the event bus (Kafka/MSQ per ADR-0004).

This is one half of the approved split (the other is `redis-state`).
