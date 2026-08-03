# AI-TOS — Master Engineering Roadmap

**Foundation (Phase 0 / 0B):** ✅ Complete (`v1.0.0-foundation`)  
**Next:** Phase 1 → Production Launch (Phase 11)

Implementation-oriented product roadmap. Build on frozen foundation: monorepo, EKS, RDS, Redis, Kafka, OTel, CI/CD, runbooks.

---

## Phase 1 — Identity & Access Management

**Objective:** Production identity, tenancy boundaries, and auditable access for all control-plane APIs.

**Scope:** AuthN/AuthZ for `apps/web` + `apps/api`; user/org persistence in PostgreSQL; sessions in `redis-state`; no trading/AI product features.

**Deliverables:** OIDC login, org CRUD, RBAC guards, API keys, session lifecycle, immutable audit log API.

**Dependencies:** Phase 0B complete (API/Web scaffolds, RDS, Redis state, Secrets, Observability).

**Exit Criteria:** Authenticated E2E login → API call with RBAC; audit events persisted; contract tests green; staging deploy via existing GitOps path.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 1.1 | Authentication | OIDC/Entra (or IdP) login, JWT issuance/validation, logout |
| 1.2 | Organization Management | Orgs, membership, invites |
| 1.3 | RBAC | Roles/permissions, Nest guards, policy checks |
| 1.4 | API Keys | Create/rotate/revoke keyed access for machines |
| 1.5 | Sessions | `redis-state` session store, TTL, revocation |
| 1.6 | Audit Logs | Append-only audit table + query API |

---

## Phase 2 — AI Gateway

**Objective:** Unified multi-provider LLM gateway with routing and cost attribution.

**Scope:** `apps/ai-service` provider adapters + gateway API; no RAG/agents yet.

**Deliverables:** Provider SDK, adapters (OpenAI, Gemini, Claude, Grok, DeepSeek, Mistral, Ollama), router, token/cost metrics.

**Dependencies:** Phase 1 (auth + API keys); Secrets Manager for provider keys; OTel metrics.

**Exit Criteria:** Authenticated chat/completions via gateway; failover routing works; cost events recorded per org/key.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 2.1 | Provider SDK | Common request/response + error contracts |
| 2.2 | OpenAI | Adapter + models config |
| 2.3 | Gemini | Adapter |
| 2.4 | Claude | Adapter |
| 2.5 | Grok | Adapter |
| 2.6 | DeepSeek | Adapter |
| 2.7 | Mistral | Adapter |
| 2.8 | Ollama | Local/self-hosted adapter |
| 2.9 | Routing | Policy-based provider/model selection + fallback |
| 2.10 | Cost Tracking | Usage meters, org attribution, export hooks |

---

## Phase 3 — Knowledge Platform (RAG)

**Objective:** Ingest documents into a searchable knowledge base with citations.

**Scope:** Upload → parse/OCR → chunk → embed → vector store → retrieval API.

**Deliverables:** Ingestion pipeline, vector DB integration, hybrid/semantic search, citation payloads.

**Dependencies:** Phase 2 (embeddings via gateway); S3; PostgreSQL metadata; async workers/Kafka as needed.

**Exit Criteria:** Upload doc → query returns grounded answers with source citations in staging.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 3.1 | Upload | Secure upload API + object storage |
| 3.2 | Parsing | PDF/DOCX/HTML/text extractors |
| 3.3 | OCR | Image/scanned PDF path |
| 3.4 | Chunking | Strategy + metadata |
| 3.5 | Embeddings | Via AI Gateway |
| 3.6 | Vector DB | Index + namespaces per org |
| 3.7 | Search | Semantic/hybrid retrieval API |
| 3.8 | Citations | Traceable chunk references in responses |

---

## Phase 4 — Agent Platform

**Objective:** Durable agent runtime with memory, planning, tools, and multi-agent orchestration.

**Scope:** Agent execution engine on `ai-service` + workers; schedules via `scheduler`.

**Deliverables:** Runtime, memory stores, planner, tool-call protocol, multi-agent graphs, cron/triggers.

**Dependencies:** Phases 1–3 (identity, gateway, RAG); Kafka for async jobs.

**Exit Criteria:** Single agent completes tool-using task; multi-agent handoff demo; scheduled run succeeds.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 4.1 | Runtime | Execute/resume/cancel agent runs |
| 4.2 | Memory | Short/long-term memory backends |
| 4.3 | Planning | Plan/act loops + guardrails |
| 4.4 | Tool Calling | Typed tool invoke + sandboxing hooks |
| 4.5 | Multi-Agent | Supervisor/worker patterns |
| 4.6 | Scheduling | Cron/event-triggered agent jobs |

---

## Phase 5 — Tool Platform

**Objective:** First-party and third-party tools as secure, installable capabilities.

**Scope:** Tool SDK + connectors; org-scoped credentials; no marketplace UI yet.

**Deliverables:** Tool SDK, Google/GitHub/Slack/Jira/Notion connectors, generic REST tool.

**Dependencies:** Phase 4 tool-calling protocol; Phase 1 secrets/API keys.

**Exit Criteria:** Agent invokes ≥3 connectors successfully with least-privilege credentials.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 5.1 | Tool SDK | Register, schema, auth, invoke contract |
| 5.2 | Google | Drive/Gmail/Calendar (scoped) |
| 5.3 | GitHub | Repos/issues/PRs |
| 5.4 | Slack | Messaging/channels |
| 5.5 | Jira | Issues/projects |
| 5.6 | Notion | Pages/databases |
| 5.7 | REST API | Configurable HTTP tool |

---

## Phase 6 — AI Applications

**Objective:** End-user product surfaces on the platform.

**Scope:** Web UX + API product features using gateway/RAG/agents/tools.

**Deliverables:** Chat, Document AI, Coding AI, Meeting AI, Research AI apps.

**Dependencies:** Phases 2–5.

**Exit Criteria:** Each app has staging E2E happy path behind auth; SLOs instrumented.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 6.1 | AI Chat | Conversational UI + history |
| 6.2 | Document AI | Doc Q&A / summarization (RAG) |
| 6.3 | Coding AI | Repo-aware assist (GitHub tool) |
| 6.4 | Meeting AI | Notes/action items pipeline |
| 6.5 | Research AI | Multi-source research agents |

---

## Phase 7 — Workflow Platform

**Objective:** Visual/automated workflows composing AI and tools with human gates.

**Scope:** Flow builder, scheduler integration, AI/condition/approval nodes.

**Deliverables:** Flow DSL + UI, scheduler, AI nodes, conditions, human approval.

**Dependencies:** Phases 4–6; existing `scheduler` worker.

**Exit Criteria:** Publish workflow with AI + approval node; runs on schedule; audit trail complete.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 7.1 | Flow Builder | Author/version flows |
| 7.2 | Scheduler | Triggers/cron bindings |
| 7.3 | AI Nodes | Gateway/agent/RAG steps |
| 7.4 | Conditions | Branching/filters |
| 7.5 | Human Approval | Pause/resume with RBAC |

---

## Phase 8 — Marketplace

**Objective:** Share and install agents, prompts, tools, and workflows across orgs.

**Scope:** Catalog, packaging, install permissions; no billing yet.

**Deliverables:** Listings for agents/prompts/tools/workflows; install/versioning.

**Dependencies:** Phases 4–7; Phase 1 orgs/RBAC.

**Exit Criteria:** Publish → install → run installed asset in another org (policy-allowed).

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 8.1 | Agents | Package/publish agents |
| 8.2 | Prompts | Prompt templates catalog |
| 8.3 | Tools | Tool packages |
| 8.4 | Workflows | Workflow templates |

---

## Phase 9 — Billing

**Objective:** Monetize usage and subscriptions.

**Scope:** Stripe integration, plans, metered usage, invoices.

**Deliverables:** Checkout/subscriptions, usage aggregation (from gateway), invoices.

**Dependencies:** Phase 2 cost tracking; Phase 1 orgs; Phase 8 optional for paid listings.

**Exit Criteria:** Subscribe → usage recorded → invoice generated in staging/test mode.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 9.1 | Stripe | Customer/payment methods |
| 9.2 | Subscription | Plans, upgrades, cancels |
| 9.3 | Usage | Meter sync from cost tracking |
| 9.4 | Invoices | Generate/deliver invoices |

---

## Phase 10 — Enterprise

**Objective:** Enterprise identity federation and governance/compliance controls.

**Scope:** SSO/SCIM/LDAP, policies, compliance exports—beyond Phase 1 baseline auth.

**Deliverables:** SSO, SCIM provisioning, LDAP bridge, governance policies, compliance packs.

**Dependencies:** Phase 1 IAM; Phase 9 for enterprise SKUs (optional).

**Exit Criteria:** SSO login + SCIM user lifecycle in staging; governance policy enforced; compliance export available.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 10.1 | SSO | SAML/OIDC enterprise IdPs |
| 10.2 | SCIM | User/group provisioning |
| 10.3 | LDAP | Directory sync/bridge |
| 10.4 | Governance | Policies, approvals, data controls |
| 10.5 | Compliance | Retention, exports, attestations |

---

## Phase 11 — Production Launch

**Objective:** Harden and ship GA production release.

**Scope:** Perf, security audit, docs, release engineering, launch.

**Deliverables:** Perf baselines, pen-test remediation, launch docs, tagged GA release, launch checklist.

**Dependencies:** Phases 1–10 as product-complete for GA scope; Phase 0B ops/DR/CI.

**Exit Criteria:** SLOs met; security findings closed or accepted; `v1.0.0` (or GA tag) released; launch comms done.

**Estimated Sub-phases:**

| ID | Name | Focus |
|---|---|---|
| 11.1 | Performance | Load tests, tuning, capacity |
| 11.2 | Security Audit | External/internal audit + fixes |
| 11.3 | Documentation | User/admin/runbook completeness |
| 11.4 | Release | Version, notes, promote prod |
| 11.5 | Launch | GA cutover + monitoring watch |

---

## Sequencing

```text
0B (done) → 1 IAM → 2 Gateway → 3 RAG → 4 Agents → 5 Tools
         → 6 Apps → 7 Workflows → 8 Marketplace → 9 Billing
         → 10 Enterprise → 11 Production Launch (GA)
```

**Rule:** Complete exit criteria of phase *N* before starting *N+1* unless explicitly parallelized by leadership.
