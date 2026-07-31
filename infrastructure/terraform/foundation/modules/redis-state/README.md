# Redis State module (Phase 0B.3 / ADR-0005)

Stateful **state** tier: user sessions, rate limiting, security-sensitive platform state.

- **Eviction:** `noeviction` — Redis rejects writes when full instead of dropping a session
  (capacity must be sized for peak sessions; scale the node type / add shards if needed).
- **Persistence:** AOF on (`appendonly=yes`, `appendfsync=everysec`) + 1 daily snapshot, so
  state survives node recycle (within RPO); not a substitute for the RDS system of record.
- **HA:** multi-AZ, automatic failover, `num_cache_clusters = 2`.
- **Security:** private subnets, SG-restricted, TLS + KMS at rest.
- **Why not Redis Streams:** the event backbone is Kafka/MSQ (ADR-0004); Redis here is purely
  a cache + state store, never a message bus.

This is the other half of the approved split (the other is `redis-cache`).
