# Kafka Topics module (Phase 0B.4)

Manages event platform topics as code (via the Kafka provider, authenticated with SCRAM).

- **Naming:** `<domain>.<entity>.<event>` (e.g. `market.orders.created`), with `.dlq` and
  `.retry` suffixed topics per domain (market/portfolio/risk/audit/notification/system).
- **Partitions:** high-throughput domains (market, risk) get 12; others 3–6.
- **Replication factor:** 3 (Multi-AZ), `min.insync.replicas=2` enforced by broker config.
- **Retention:** event topics 7–14 days; DLQs 30–365 days; audit 90 days.
- **Cleanup:** `delete` (per-topic `compact` available for keyed state topics, e.g. `risk.limits`).
- **DLQ/Retry:** every domain has `.dlq` + `.retry` topics; retry uses a redelivery pattern
  (consumers replay from `.retry`; poison messages land in `.dlq` for inspection/replay).

No producers or consumers are defined — this module only provisions the topic surface.
