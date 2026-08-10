# AI-TOS — Platform Freeze Summary

**Purpose:** Upload this file first in any new AI chat so the assistant does not confuse the **frozen platform** with **product/trading design**.

**Status:** Platform Phase 0 + Phase 1 + Phase 2 are **permanently frozen**. Do not redesign them.

---

## 1. Hard rules

1. Phase 0, Phase 1, and Phase 2 (AI OS Layers 1–6) are **frozen**.
2. Treat three layers of truth separately:
   - **A) Platform** — implemented and frozen
   - **B) Engineering foundation** — infra, ADRs, patterns
   - **C) Product** — trading MVP / agent roles / domain (may be incomplete; not the same as platform modules)
3. Never treat product agent names (Chief AI, Guardian AI, Strategy AI, etc.) as implemented Nest modules.
4. Never treat DDD / CQRS / Outbox mentions as completed product domain models.
5. If any document conflicts with this summary or `docs/AI_BRAIN_ARCHITECTURE.md`, **the frozen platform wins**.

---

## 2. What is frozen (complete platform)

### Phase 0 — Platform Foundation
- Monorepo (pnpm + Turbo)
- Infrastructure (Terraform, EKS, RDS, Redis split, MSK/Kafka)
- DevOps / CI/CD / GitOps (Helm, Kustomize, Argo CD)
- Observability stack (OTel, Prometheus, Loki, Tempo, Grafana)
- ADRs and runbooks

### Phase 1 — Identity Platform
- Auth (JWT + Argon2id + refresh)
- Organizations / membership
- RBAC
- API keys
- Sessions
- Audit logs

### Phase 2 — AI OS (Layers 1–6)

| Layer | Name | Role |
|---|---|---|
| 1 | Foundation Runtime | Config, secrets, logging, metrics, health, cache, event bus |
| 2 | AI Kernel | Schedule, state, resources, lifecycle, communication, context |
| 3 | Cognitive | Perception → Thinking → Decision → Planning → Output |
| 4 | AI Services | Memory, Knowledge, Capability, Model, Tool, Integration, Policy |
| 5 | Execution Runtime | Workflow → Tasks → Parallel execute → Reliability → Streaming → Finalizer |
| 6 | Developer Platform | SDK, Playground, Testing, Evaluation, Benchmark, Debug, Observability |

---

## 3. Ownership freezes (non-negotiable)

| Concern | Owner | Not owned by |
|---|---|---|
| Telemetry collection | Layer 1 (+ Phase 0 infra collectors) | Layer 6.7 Observability (compose only) |
| Recovery checkpoints | Layer 5.4 Reliability | Layer 6.6 Debug (inspection snapshots only) |
| Kernel schedule/state/resources/lifecycle | Layer 2 | Cognitive / Execution product logic |
| Membership vs authorization | Phase 1 orgs vs RBAC | AI layers (consume org context only) |
| Evaluation scores | Layer 6.4 Evaluation | Layer 6.5 Benchmark (consumes results only) |

---

## 4. What is NOT the platform

These may appear in product docs. They are **not** frozen platform modules:

- Trading product domains (Orders, Portfolio, Candles as product aggregates)
- Product agent roster (Chief AI, CEO AI, Guardian AI, …)
- Full product DDD bounded contexts / aggregates (still to be designed)
- Product service specs and end-to-end trading workflow specs (still to be designed)

**Next major work:** Product Domain Architecture + Product Service Architecture + Product Workflows — **on top of** this frozen platform, without redesigning Layers 1–6.

---

## 5. Canonical documents (read order)

1. This file — `docs/project/PLATFORM_FREEZE_SUMMARY.md`
2. `docs/project/PROJECT_STATUS.md`
3. `docs/AI_BRAIN_ARCHITECTURE.md`
4. `docs/ai-kernel-ownership.md`
5. `docs/architecture.md`
6. `docs/project/MASTER_ROADMAP.md`
7. `docs/project/DECISIONS.md`

---

## 6. Allowed assistant behavior

- Explain or navigate the frozen platform
- Design **product** architecture that **consumes** platform public APIs
- Propose new product modules **outside** Layers 1–6

## Disallowed assistant behavior

- Redesign Phase 0 / 1 / 2
- Merge/split frozen layers “for cleanliness”
- Invent trading services as if they already exist in `apps/api`
- Replace Kernel / Execution / Reliability ownership
