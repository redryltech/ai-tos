# ADR-0010: Observability — OpenTelemetry + Prometheus + Grafana + Loki + Alertmanager

- **Status:** Accepted (architecture only; instrumentation in Phase 0B+)
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; pipelines scaffolded now)

## Context

Phase 0A declared "metrics/OTel in later phases" with only `/health` + structured logs.
The board (verdict: ⚠ APPROVED WITH CHANGES, Priority 7) requires a finalized
observability architecture covering tracing, metrics, and logging before Phase 0B.

## Decision

A single **OpenTelemetry (OTel)** instrumentation standard feeds three signal pipelines.
No vendor lock-in at the SDK layer; OTLP everywhere.

### Tracing
- **OTel SDK** in every service (auto-instrumentation where possible). Spans exported via
  **OTLP** to an **OTel Collector** (DaemonSet + Gateway). Traces stored in **Tempo**
  (or AWS X-Ray as managed alternative) for distributed tracing across API → AI service →
  workers → Kafka.

### Metrics
- **RED/USE metrics** (rate, errors, duration; utilisation, saturation, errors) scraped by
  **Prometheus** (Amazon Managed Prometheus / AMP) via `ServiceMonitor`/`PodMonitor`.
  Long-term retention via remote-write to AMP or Thanos. No business KPIs in Phase 0A —
  only health, latency, error rate, saturation.

### Logging
- Structured JSON logs from every service → **Loki** (or CloudWatch Logs as managed
  alternative) with labels by service/tenant. No secrets in logs (redaction middleware).

### Dashboards & alerting
- **Grafana** dashboards-as-code (provisioned from git) for SLO/health/infra.
- **Alertmanager** (or AMP alerting rules) routes to on-call (PagerDuty/Opsgenie) with
  severity tiers; alerts on error-rate, p99 latency, pod restarts, DLQ depth, secret
  rotation failures, Redis/Kafka/Postgres health.

### Collector topology
- **OTel Collector DaemonSet** (node-local scrape + tail logs) → **Gateway** (batch,
  export, sampling) → backends. Sampling: head/tail sampling to control cost at scale.

## Alternatives considered

- **Vendor-only (Datadog/New Relic)** — *Rejected as primary* for lock-in; acceptable as a
  backend sink later. OTel keeps options open.
- **CloudWatch only** — insufficient for traces/metrics depth and cross-signal correlation.
- **Jaeger standalone (no OTel)** — *Rejected*; OTel is the industry-standard instrumentation
  boundary and avoids per-backend SDKs.

## Consequences

- Unified, portable observability; traces/metrics/logs correlated by trace_id.
- Operational surface (Collector, Prometheus, Loki, Grafana, Alertmanager) to run —
  mitigated by AMP/Managed Prometheus + Grafana Cloud / EKS add-ons.
- Sampling and retention policies required to control cost.

## References

- ADR-0004 (Kafka DLQ metrics), ADR-0009 (secret-rotation alerts),
  `docs/review-board-changes.md` Priority 7.
