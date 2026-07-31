# Observability Architecture (ADR-0010)

**Architecture only** (instrumentation in Phase 0B+). Single standard: **OpenTelemetry**.

## Signal pipeline
| Signal | Source | Collect | Store | Visualize / Alert |
|---|---|---|---|---|
| Traces | OTel SDK (auto-instr) | OTel Collector (DaemonSet+Gateway) | Tempo / AWS X-Ray | Grafana |
| Metrics | RED/USE via SDK/exporters | OTel Collector → Prometheus | Prometheus / AMP | Grafana + Alertmanager |
| Logs | Structured JSON (redacted) | OTel Collector / Promtail | Loki (+ CloudWatch) | Grafana |

## Components (cluster add-ons, installed per `kustomize` overlay)
- **OTel Collector** — node-local DaemonSet (scrape/tail) → Gateway (batch, sample, export).
- **Prometheus / Amazon Managed Prometheus** — scrape via `ServiceMonitor`/`PodMonitor`.
- **Loki** — log aggregation, labels by service/tenant.
- **Tempo / X-Ray** — distributed traces; correlated by `trace_id`.
- **Grafana** — dashboards-as-code (provisioned from git).
- **Alertmanager** — severity-tiered alerts: error rate, p99 latency, pod restarts,
  **Kafka DLQ depth**, **secret-rotation failures**, Redis/Kafka/Postgres health.

## Phase 0A scope
No instrumentation code yet. Foundation defines: signal flow, retention/sampling policy,
dashboards-as-code, and alert rules. Phase 0B wires OTel SDK per service; Phase 1+ adds
business SLOs and chaos validation.

## Cost controls
Head/tail sampling; retention tiers (metrics 15d hot / 1y cold; logs 30d); AMP for long-term.
