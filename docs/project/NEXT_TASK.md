# AI-TOS — Next Task

> Complete this phase only, then stop.

---

## Current Phase

**2.1.6 — Provider SDK Contracts**

| Field | Value |
|---|---|
| Status | ⬜ Not started |
| Depends on | ✅ Phase 2.1.5 Health Service |
| Stop policy | **Stop after Phase 2.1.6** — do not start Phase 2.1.7 |

---

## Objective

Common AI provider request/response + error contracts for the AI Gateway (Provider SDK baseline).

---

## Deliverables

| # | Item |
|---|---|
| 1 | Shared provider SDK contracts |
| 2 | Request/response types |
| 3 | Error model |
| 4 | Adapter interface baseline |

---

## Validation

```bash
pnpm build
pnpm typecheck
pnpm lint
```

---

## Prior Phase (2.1.5) — Complete

- [x] HealthModule + HealthService (DI)
- [x] `/health` · `/ready` · `/live` (K8s probes)
- [x] Monitors API, Database, Redis, Cache, AI Gateway, Event Bus
- [x] ConfigService health section
- [x] Unit tests
- [x] **STOPPED** — Phase 2.1.6 not started

---

## References

- [`MASTER_ROADMAP.md`](./MASTER_ROADMAP.md)
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
