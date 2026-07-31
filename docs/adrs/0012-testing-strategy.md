# ADR-0012: Testing strategy — health, contract, integration, smoke, perf, chaos

- **Status:** Accepted (Phase 0A scope: health + contract + smoke scaffold; rest roadmap)
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; gates defined now)

## Context

Phase 0A had only `echo`-style/syntax tests. The board (verdict: ⚠ APPROVED WITH CHANGES,
Priority 9) requires a defined testing pyramid: health, contract, integration, smoke,
performance, and a chaos-engineering roadmap.

## Decision

| Layer | Tooling | Scope (Phase) | Gate |
|---|---|---|---|
| **Health** | `curl /health` per service (in-cluster + CI) | 0A | Required on every PR + post-deploy |
| **Contract** | OpenAPI (API) + Schema Registry compat (events) + shared-type tests (`@ai-tos/shared`) | 0A | PR blocks on contract break |
| **Integration** | Testcontainers (Postgres + Kafka) for API/workers | 1+ | On merge to `main` |
| **Smoke** | Post-deploy: login + `/health` + critical path | 0B | Blocks promotion dev→staging→prod |
| **Performance** | k6 / Artillery baseline SLOs (p99, RPS) | 1+ | Weekly + pre-prod gate |
| **Chaos** | Litmus / Chaos Mesh (pod kill, latency, partition) in staging | 2+ | Roadmap; game-days |

### Principles
- **Contract-first:** `@ai-tos/shared` types are the API/SDK contract; event schemas are
  registry-checked (ADR-0004). A breaking change fails CI.
- **No business logic tests in Phase 0A** (foundation only) — tests cover plumbing,
  health, and contracts, not trading/AI behavior.
- **Ephemeral infra:** integration/perf tests spin their own Postgres + Kafka (containers),
  never shared state.
- **Ownership:** each `apps/*` owns its health + contract tests; platform owns smoke/perf
  harness.

## Alternatives considered

- **E2E-only** — *Rejected*: slow, flaky; pyramid favors fast unit/contract first.
- **Manual smoke** — *Rejected*: not reproducible; automate post-deploy.
- **No chaos plan** — *Rejected*: board requires a resilience roadmap for money-correct
  systems.

## Consequences

- Fast feedback (health/contract) + confidence gates (smoke/perf) + resilience evidence
  (chaos).
- Test infra (containers, k6, chaos mesh) to operate in Phase 1+.
- Clear, phase-appropriate scope — no premature business tests.

## References

- ADR-0004 (event schema registry), ADR-0007 (smoke via Argo CD sync), ADR-0010 (alerts),
  `docs/review-board-changes.md` Priority 9.
