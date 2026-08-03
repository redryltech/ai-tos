# AI-TOS — Next Task

> Complete this phase only, then stop.

---

## Current Phase

**2.1.3 — Provider SDK Contracts**

| Field | Value |
|---|---|
| Status | ⬜ Not started |
| Depends on | ✅ Phase 2.1.2 Secrets Service |
| Stop policy | **Stop after Phase 2.1.3** — do not start Phase 2.1.4 |

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

## Prior Phase (2.1.2) — Complete

- [x] SecretsModule + SecretsService (DI)
- [x] Secret provider abstraction (env + memory)
- [x] JWT / encryption / API / AI provider secret retrieval
- [x] Rotation + in-memory cache + redaction
- [x] Unit tests
- [x] **STOPPED** — Phase 2.1.3 not started

---

## References

- [`MASTER_ROADMAP.md`](./MASTER_ROADMAP.md)
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
