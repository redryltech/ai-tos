# AI-TOS — Next Task

> Complete this phase only, then stop.

---

## Current Phase

**1 — Identity, Auth & Core Services**

| Field | Value |
|---|---|
| Status | ⬜ Not started |
| Depends on | ✅ Phase 0 (0A–0B.8) |
| Version target | `v1.0.0-phase1` / per roadmap |
| Stop policy | **Stop after Phase 1** — do not start Phase 2 |

---

## Objective

Wire real identity and deploy core control-plane services: IdP/OIDC, user store + sessions, RBAC, authenticated API/Web to EKS, audit persistence, Outbox foundation, contract + integration tests.

---

## Deliverables (roadmap)

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

## Prior Phase (0B.8) — Complete

- [x] RPO/RTO runbooks
- [x] Multi-AZ failure drills (staging)
- [x] Backup restore verification
- [x] On-call alert routing + severity taxonomy
- [x] Phase 0 platform exit criteria
- [x] **STOPPED** after 0B.8

---

## References

- [`ROADMAP.md`](./ROADMAP.md)
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
