# AI-TOS — Next Task

> Complete this phase only, then stop.

---

## Current Phase

**1 — Identity, Auth & Core Services**

| Field | Value |
|---|---|
| Status | ⬜ Not started |
| Depends on | ✅ Phase 0 / Foundation 0B **COMPLETE** (0A–0B.10) |
| Stop policy | **Stop after Phase 1** — do not start Phase 2 |

---

## Objective

Wire real identity and deploy core control-plane services: IdP/OIDC, user store + sessions, RBAC, authenticated API/Web to EKS, audit persistence, Outbox foundation, contract + integration tests.

---

## Deliverables

| # | Item |
|---|---|
| 1 | Entra ID / OIDC identity provider integration |
| 2 | User store + session model (`redis-state`) |
| 3 | RBAC end-to-end |
| 4 | API + Web authenticated deploy (dev → staging) |
| 5 | Audit log persistence (PostgreSQL) |
| 6 | Outbox relay foundation |
| 7 | Contract + integration tests |

---

## Validation

```bash
pnpm build
pnpm typecheck
pnpm lint
```

---

## Prior Phase (0B.10) — Complete

- [x] Production readiness checklist
- [x] Final validation report
- [x] Foundation (Phase 0B) marked complete
- [x] **STOPPED** — Phase 1 not started

---

## References

- [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md)
- [`VALIDATION_REPORT.md`](./VALIDATION_REPORT.md)
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
