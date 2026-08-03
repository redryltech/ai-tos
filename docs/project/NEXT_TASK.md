# AI-TOS — Next Task

> Complete this phase only, then stop.

---

## Current Phase

**2.1.8 — Provider SDK Contracts**

| Field | Value |
|---|---|
| Status | ⬜ Not started |
| Depends on | ✅ Phase 2.1.7 Event Bus · ✅ **Layer 1 complete** |
| Stop policy | **Stop after Phase 2.1.8** — do not start Phase 2.1.9 |

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

## Prior Phase (2.1.7) — Complete

- [x] EventBusModule + EventBusService (DI)
- [x] Publish / subscribe / unsubscribe
- [x] Async + typed events + topic routing
- [x] ConfigService event bus section
- [x] Unit tests
- [x] **Layer 1 (2.1.1–2.1.7) COMPLETE**
- [x] **STOPPED** — Phase 2.1.8 not started

---

## References

- [`MASTER_ROADMAP.md`](./MASTER_ROADMAP.md)
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
