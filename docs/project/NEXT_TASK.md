# AI-TOS — Next Task

> Complete this phase only, then stop.

---

## Current Phase

**0B.8 — Resilience, DR & Runbooks**

| Field | Value |
|---|---|
| Status | ⬜ Not started |
| Depends on | ✅ 0A–0B.7 |
| Version target | `v0.8.0` |
| Stop policy | **Stop after Phase 0B.8** |

---

## Objective

Deliver RPO/RTO runbooks, Multi-AZ failure drills (staging), backup restore verification, on-call alert routing + severity taxonomy, and Phase 0 platform exit criteria sign-off.

---

## Deliverables

| # | Deliverable |
|---|---|
| 1 | RPO/RTO runbooks (RDS PITR, Redis, MSK, state CRR) |
| 2 | Multi-AZ failure drills (staging) |
| 3 | Backup restore verification |
| 4 | On-call alert routing + severity taxonomy |
| 5 | Phase 0 platform exit criteria signed off |

---

## Validation

```bash
pnpm build
pnpm typecheck
pnpm lint
```

---

## Out of Scope

- Phase **1+** identity / market / AI / risk / execution
- Redesign of completed 0A–0B.7 modules

---

## Prior Phase (0B.7) — Complete

- [x] OIDC Terraform gates (staging/production Environments)
- [x] SBOM + Cosign signing
- [x] Security scan gates (SAST/deps/IaC/image)
- [x] Protected Environments docs
- [x] Post-deploy smoke tests
- [x] Docs updated
- [x] **STOPPED** after 0B.7

---

## References

- ADR-0011, ADR-0012
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
