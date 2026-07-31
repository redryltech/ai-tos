# Testing Strategy (ADR-0012)

Testing pyramid for the AI-TOS foundation. No business-logic tests in Phase 0A.

| Layer | Tooling | Phase | Gate |
|---|---|---|---|
| Health | `curl /health` per service (CI + in-cluster) | 0A | Required every PR + post-deploy |
| Contract | OpenAPI (API) + Schema Registry (events) + `@ai-tos/shared` types | 0A | PR blocks on contract break |
| Integration | Testcontainers (Postgres + Kafka) | 1+ | On merge to `main` |
| Smoke | Post-deploy: login + `/health` + critical path | 0B | Blocks dev→staging→prod |
| Performance | k6 / Artillery baseline SLOs (p99, RPS) | 1+ | Weekly + pre-prod |
| Chaos | Litmus / Chaos Mesh (pod kill, latency, partition) in staging | 2+ | Roadmap; game-days |

## Principles
- **Contract-first:** shared types are the API/SDK contract; event schemas are registry-checked.
- **Ephemeral infra:** integration/perf spin their own Postgres + Kafka — never shared state.
- **Ownership:** each `apps/*` owns health + contract; platform owns smoke/perf/chaos harness.

## Phase 0A scope (implemented)
Health + contract gates in `ci.yml`; shared-type contract check. No premature business tests.
