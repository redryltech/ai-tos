# AI-TOS — Next Task

> Single source of truth for the **current** implementation assignment.  
> Agents and engineers should complete this phase only, then stop.

---

## Current Phase

**0B.6 — Observability Platform**

| Field | Value |
|---|---|
| Status | 🔄 In progress |
| Depends on | ✅ 0A · ✅ 0B.1 · ✅ 0B.2 · ✅ 0B.3 · ✅ 0B.4 · ✅ 0B.5 |
| Version target | `v0.6.0` (after completion) |
| Stop policy | **Stop after Phase 0B.6** — do not start 0B.7+ |

---

## Objective

Provision and wire the AI-TOS **observability platform** so every service can emit metrics, logs, and traces through a single OpenTelemetry pipeline into Prometheus, Loki, Tempo, and Grafana (plus alerting).

Align with ADR-0010 and `docs/observability.md`. No trading or AI decision business logic.

---

## Deliverables

| # | Deliverable | Description |
|---|---|---|
| 1 | **Prometheus** | Metrics collection path (Prometheus and/or Amazon Managed Prometheus), ServiceMonitor/PodMonitor patterns, RED/USE baselines |
| 2 | **Grafana** | Dashboards-as-code for platform/SLO health; datasource wiring to metrics/logs/traces |
| 3 | **Loki** | Structured log aggregation pipeline with service/tenant labels; secret redaction expectations |
| 4 | **Tempo** | Distributed tracing backend for OTLP spans across API → AI → workers → Kafka |
| 5 | **OpenTelemetry** | OTel Collector (DaemonSet/Gateway as designed) + instrumentation baseline for services |

### Supporting expectations

- Alertmanager (or AMP-equivalent) rules for error rate, p99 latency, restarts, DLQ depth, datastore health
- Helm/Kustomize packaging under the existing Kubernetes delivery model
- Terraform modules/env wiring only as required for 0B.6 (no unrelated infra expansion)
- Documentation updates for operators (observability runbook pointers)

---

## Validation

All of the following must succeed before marking 0B.6 complete:

```bash
terraform validate
helm template
pnpm build
pnpm typecheck
```

| Check | Purpose |
|---|---|
| `terraform validate` | IaC for observability resources is syntactically/structurally valid |
| `helm template` | Charts/overlays render without error |
| `pnpm build` | Monorepo packages and apps compile |
| `pnpm typecheck` | TypeScript contracts remain sound |

Additional recommended checks (if touched): `terraform fmt -check`, Helm lint, and CI workflow green on the PR.

---

## Out of Scope

- Phase **0B.7** CI/CD production gates
- Phase **0B.8** DR runbooks completion
- Phase **1+** identity, market data, AI decisions, risk, execution
- Trading / broker / model business logic
- Redesign of completed 0A–0B.5 modules

---

## Completion Checklist

- [ ] Prometheus deliverable implemented
- [ ] Grafana deliverable implemented
- [ ] Loki deliverable implemented
- [ ] Tempo deliverable implemented
- [ ] OpenTelemetry deliverable implemented
- [ ] `terraform validate` passes
- [ ] `helm template` passes
- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` passes
- [ ] `PROJECT_STATUS.md` updated (phase → complete; next → 0B.7)
- [ ] `ROADMAP.md` 0B.6 items checked
- [ ] `CHANGELOG.md` entry for `v0.6.0` drafted
- [ ] **STOP** — wait for the next explicit instruction

---

## References

- ADR-0010: `docs/adrs/0010-observability.md`
- Observability overview: `docs/observability.md`
- Project context: [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)
- Roadmap: [`ROADMAP.md`](./ROADMAP.md)
- Decisions: [`DECISIONS.md`](./DECISIONS.md)
