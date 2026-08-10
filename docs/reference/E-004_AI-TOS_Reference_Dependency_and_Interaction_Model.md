# E-004

# AI-TOS Reference Dependency and Interaction Model

**Document:** E-004_AI-TOS_Reference_Dependency_and_Interaction_Model  
**Version:** 0.1  
**Status:** Architecture Design — NOT FROZEN  
**Parents:** E-001 · E-002 · E-003 · AI-TOS-000 · Platform Architecture v1.0 (SA-000…SA-015, FROZEN) · UAIA v1.0 · ATI Constitution · DDD Constitution · PRODUCT Constitution  
**Authority role:** Lawful reference-level dependency and interaction patterns among P0–P8 and the external ATI/Product boundary. Subordinate to E-001…E-003 and all frozen constitutions above.  

**Rules of construction:**

- Preserves UAIA, ATI, DDD, PRODUCT, AI-TOS-000, SA-000…SA-015, E-001, E-002, and E-003.  
- No redesign, no new ownership, no SA-016, no ATI capability absorption.  
- No concrete services, microservices, classes, schemas, protocols, cloud architecture, deployment topology, languages, frameworks, or code.  
- Does not convert P0–P8 into deployment units.  

**Critical distinction:**

> Dependency ≠ Ownership  
> Interaction ≠ Ownership  
> Reference relationship ≠ Runtime implementation  
> A plane may depend on another plane without acquiring that plane’s primary responsibility.

---

# 1. Definition

The **AI-TOS Reference Dependency and Interaction Model** defines how P0–P8 planes and the external ATI/Product boundary may **depend on** and **interact with** each other at reference level **without transferring ownership**.

It answers:

> How may the reference architecture components depend on and interact with each other without transferring ownership?

---

# 2. Purpose

E-004 exists to:

1. Specify lawful dependency directions among planes;  
2. Specify lawful interaction patterns without creating new ownership;  
3. Prevent circular ownership, ambient/universal dependency, hidden service ownership, hidden orchestration, and semantic leakage;  
4. Bound ATI ↔ AI-TOS interaction without ATI absorption;  
5. Bound failure propagation so anomalies do not rewrite meaning or transfer ownership.

Without this model, E-002/E-003 compositions can be misread as implementation graphs or ownership transfers.

---

# 3. Authority

```
UAIA → ATI → DDD → PRODUCT → AI-TOS-000
  → Platform Architecture v1.0 (SA-000…SA-015)
  → E-001 → E-002 → E-003 → E-004
  → Implementation / Phase F+ (deferred)
```

Higher constitutions always win.  
E-004 composes dependency/interaction law; it does not create ownership.

---

# 4. Dependency Model

## Definition

A **dependency** is a reference-level need of one plane for support, constraint, exposure, evidence, allocation, or connection from another plane — **without acquiring** the receiver’s primary responsibility.

## Dependency template

Every allowed dependency pattern is defined by:

| Field | Meaning |
|---|---|
| **Initiator** | Plane that depends |
| **Receiver** | Plane depended upon |
| **Purpose** | Why the dependency exists |
| **Responsibility retained by** | Who keeps the primary job |
| **What may cross** | Lawful crossing content |
| **What cannot cross** | Forbidden crossing / seizure |
| **What happens on failure** | Anomaly stays engineering; no meaning rewrite |

## Dependency laws

1. Dependency ≠ ownership transfer.  
2. Upward conformance dependencies are always allowed toward higher constitutions.  
3. Lateral/support dependencies require constitutional justification.  
4. Ambient/universal dependency meshes are forbidden.  
5. No dependency may create a god layer or hidden orchestrator.

---

# 5. Interaction Model

## Definition

An **interaction** is a reference-level exchange (request, response, occurrence, representation, determination, evidence, posture, or handoff) across a lawful boundary — **without transferring ownership**.

## Interaction laws

1. Interaction ≠ ownership.  
2. Interaction may be conceptually **synchronous** or **asynchronous** as reference timing posture only.  
3. Timing posture does **not** select protocols, brokers, queues, RPC technologies, frameworks, or cloud products.  
4. Interaction must obey E-003 crossing rules and SA Must-Never-Overlap laws.  
5. Interaction must not invent Facts, Decisions, Outcomes, Experience, Memory, Truth, or Product meaning.

## Conceptual timing postures (not technology)

| Posture | Reference meaning | Must not imply |
|---|---|---|
| **Synchronous** | Initiator expects a paired response in the same interaction frame | Specific RPC/protocol |
| **Asynchronous** | Initiator and receiver are not bound to a paired response in the same interaction frame | Specific broker/queue/product |

---

# 6. Allowed Dependency Directions

## Constitutional / foundation direction

```
Higher constitutions
  ← conformance dependency from all planes
P0 Foundation & Composition
  ← arrangement/constraint dependency from P1…P8
```

## Core operational direction

| Initiator | Receiver | Purpose | Responsibility retained by | May cross | Cannot cross | On failure |
|---|---|---|---|---|---|---|
| **P1** | **P0** | Module/principles/configuration support | SA-002/001/008 / P1 keeps Service+Runtime | Constraints, parameters | Product/cognitive ownership | Config/module anomaly; no Decision invention |
| **P2** | **P1** | Expose/accept owned behavior | SA-003/004 | Requests/acceptances | API/Event becoming Service | Interaction anomaly; no Decision creation |
| **P1** | **P2** | Publish/communicate occurrence or interface needs | SA-005/006 | Occurrence/interface representations | Event→Outcome/Fact/Decision | Occurrence anomaly; no Outcome invention |
| **P1** | **P3** | Durable representation use | SA-007 | Representations/references | Persistence→Truth/Memory | Persistence anomaly; no Fact/Memory rewrite |
| **P2** | **P3** | Carry/store interaction representations when justified | SA-007 | Representations | Semantic identity transfer | Same as P3 anomaly law |
| **Any** | **P4** | Protection / authorized-operation determination | SA-009/013 | Authn/authz effects; principal refs | Access→business Decision; Secrets→Configuration | Protective/access anomaly; deny ≠ Decision |
| **Any** | **P5** | Visibility/evidence | SA-010 | Telemetry | Telemetry→Truth/Decision | Observability anomaly; missing telemetry ≠ missing Truth |
| **Any** | **P6** | Conformance governance/evidence | SA-012 | Conformance constraints/evidence | Governance→UAIA/ATI/DDD/PRODUCT rewrite | Conformance anomaly; incomplete evidence ≠ invented Facts |
| **Any** | **P7** | Resources / continued controlled operation | SA-014/011 | Allocation/continuity postures | Allocation/recovery→Decision/Truth | Resource/health anomaly; no Decision invention |
| **Any** | **P8** | Justified connection/handoff | Connected owners retain ownership; P8 retains connection-only | Connection representations | Integration→ownership/orchestration | Connection anomaly; no ownership transfer |
| **External ATI** | **P2/P4/P8** (+ supporting planes) | Consume Platform capabilities | ATI keeps product meaning; Platform keeps SA jobs | Product-owned requests/context; platform results/representations | ATI capabilities as Platform owners | External failure stays outside; Platform anomalies stay Platform |

## Forbidden dependency directions

1. P8 depending on “owning” P1/P2/P4 meaning.  
2. P2 depending as if it owns P1 behavior.  
3. P3 depending as if it owns Truth/Memory.  
4. P5/P6 depending as if they own Facts/Decisions/Outcomes.  
5. P4 Access depending as if it owns business Decisions.  
6. P7 depending as if allocation/recovery owns Decisions/Truth.  
7. AI-TOS depending on ATI product identity for Platform meaning.  
8. Any ambient A↔everyone dependency mesh.

---

# 7. Allowed Interaction Patterns

Each pattern is reference-only.

| Pattern | Planes | Timing posture | Purpose | Ownership retained by | Cannot become |
|---|---|---|---|---|---|
| **Request → response** | External/P2 ↔ P1 | Sync or async conceptually | Request owned behavior; return engineering result | Service/Runtime (P1); API (P2) | Decision creation; API-as-Service |
| **Command/request → execution** | P2 → P1 → Runtime | Sync or async conceptually | Enact owned Service behavior | SA-003/004 | Runtime-as-orchestrator/business-logic |
| **Occurrence → observation** | P1/P2 → P5 (and consumers) | Typically async conceptually | Communicate that something occurred; observe telemetry | Event (occurrence rep.); Observability (visibility) | Event→Outcome/Fact; telemetry→Truth |
| **Representation → persistence** | P1/P2 → P3 | Sync or async conceptually | Durably represent information owned elsewhere | Persistence (representation only) | Persistence→Truth/Memory |
| **Access determination → operation** | P4 → Any operation plane | Sync conceptually for determination | Permit/deny platform operation | Identity/Access + Security | Access→business Decision |
| **Conformance evidence → governance** | Any → P6 | Async conceptually common | Prove/govern Platform conformance | Audit & Governance | Audit→Fact/Decision/Outcome |
| **Resource posture → execution continuity** | P7 ↔ P1 (and others) | Sync or async conceptually | Allocate/sustain controlled operation | Resource & Capacity; Health & Resilience | Allocation/recovery→Decision/Truth |
| **Connection/handoff → integration** | P8 ↔ connected planes | Sync or async conceptually | Connect independently owned responsibilities | Connected owners; Integration connects only | Integration→universal coordinator |

**Pattern law:** These patterns must not create new business, cognitive, or product ownership.

---

# 8. ATI / Product Boundary

## ATI may

1. Consume lawful AI-TOS capabilities (via P2/P4/P8 and supporting planes).  
2. Provide product-owned requests/context.  
3. Receive platform-owned results/representations.

## AI-TOS must not

1. Own ATI Strategy.  
2. Own ATI Trading Intelligence.  
3. Own ATI Opportunity.  
4. Own ATI Presentation.  
5. Own ATI Business Decisions.  
6. Become Trading OS.

## Boundary interaction summary

| Direction | Allowed | Ownership |
|---|---|---|
| **ATI → AI-TOS** | Consume / request / authenticate / receive | ATI retains product meaning |
| **AI-TOS → ATI** | Expose platform capabilities / return platform results | Platform retains SA jobs; does not own ATI meaning |

---

# 9. Circular Dependency Rules

## Circular dependency test

Reject architectural cycles of the form:

- `A → B → A` as **ownership/dependency ownership cycles**  
- `A → B → C → A` as **ownership/dependency ownership cycles**

## Legitimate interaction cycles vs forbidden ownership cycles

| Kind | Example | Verdict |
|---|---|---|
| **Legitimate interaction cycle** | P2 requests P1; P1 later emits occurrence via P2; P5 observes | Allowed if ownership unchanged |
| **Legitimate support cycle appearance** | P1 uses P3; later P1 reads P3 | Allowed as use of durable representation, not ownership cycle |
| **Forbidden ownership cycle** | P2 owns P1 behavior and P1 owns P2 interface as merged owner | Reject |
| **Forbidden coordinator cycle** | P8 owns P1 and P1 depends on P8 as owner of behavior | Reject |
| **Forbidden ATI meaning cycle** | AI-TOS depends on ATI product identity for Platform meaning, while ATI depends on AI-TOS as owner of ATI meaning | Reject |

**Rule:** Do not invent a universal coordinator to “solve” a cycle. Break ownership cycles by restoring primary jobs and justified one-way support/interaction.

---

# 10. Hidden Coupling Rules

Hidden coupling is forbidden when any of the following appear:

1. Ambient/universal dependency from every plane to every plane.  
2. Hidden service ownership via API/Event/Integration naming.  
3. Hidden orchestration via Runtime/Integration/Governance convenience.  
4. Semantic leakage (engineering artifacts treated as Facts/Decisions/Outcomes/Memory/Truth).  
5. Shared mutable ownership of unrelated primary jobs across planes.  
6. ATI product logic smuggled into Platform planes as “shared dependency.”  
7. Configuration/Secrets/Identity collapsed into one ambient control mesh.

**Prevention:** Every dependency/interaction must declare initiator, receiver, purpose, retained ownership, and forbidden crossing per §4 template.

---

# 11. Failure Propagation

Failure in one plane must not automatically transfer ownership or meaning to another plane.

| Failure | Must not become |
|---|---|
| Runtime failure | Decision failure / Decision invention |
| Persistence failure | Truth failure / Fact rewrite |
| Authorization denial | Business Decision |
| Observability failure | Missing Truth |
| Resource exhaustion | Business Decision |
| Integration failure | Ownership transfer |
| Event duplication/delay/loss | Outcome/Fact invention |
| API rejection/unavailability | Service ownership seizure |
| Audit incompleteness | Invented Facts/Decisions |
| Health degradation/recovery | Truth/Decision rewrite |
| External ATI consumer failure | Forced absorption of ATI meaning into AI-TOS |

**Propagation law:** A plane may observe or respond to another plane’s engineering anomaly under its own primary job; it may not inherit or rewrite the failed plane’s owned meaning.

---

# 12. Replaceability

Dependency/interaction patterns are replaceable when:

1. Patterns can be remapped without changing SA primary jobs;  
2. Sync/async timing posture can change without technology freeze or ownership change;  
3. ATI connection points can move without AI-TOS acquiring ATI ownership;  
4. Removing a pattern does not force UAIA/ATI/DDD/PRODUCT redesign;  
5. No pattern is irreplaceable because it became a hidden orchestrator.

---

# 13. Invalid Conditions

A dependency/interaction model is invalid when any of the following occur:

1. Dependency is treated as ownership transfer.  
2. Interaction creates Facts/Decisions/Outcomes/Memory/Truth/Product ownership.  
3. Ownership cycles or coordinator cycles exist.  
4. Ambient/universal dependency meshes exist.  
5. Hidden service ownership or hidden orchestration exists.  
6. ATI capabilities are absorbed into AI-TOS dependencies.  
7. AI-TOS depends on ATI product identity for Platform meaning.  
8. Sync/async posture freezes protocols/brokers/queues/RPC/cloud products.  
9. P0–P8 are converted into mandatory deployment units by dependency graphs.  
10. E-001…E-003 or SA-000…SA-015 are redefined.  
11. Failure propagation rewrites meaning or transfers ownership.

---

# 14. Freeze Criteria

E-004 may be frozen only when all are true:

1. Allowed dependency directions preserve SA primary jobs and E-003 boundaries.  
2. Allowed interaction patterns create no new ownership.  
3. Circular ownership/dependency cycles are absent; only legitimate interaction cycles remain.  
4. Hidden coupling protections are explicit.  
5. Failure propagation preserves anomaly non-amendment.  
6. ATI ↔ AI-TOS boundary is unbreached.  
7. Technology neutrality holds (including sync/async as conceptual only).  
8. Replaceability holds.  
9. Invalid Conditions are absent.  
10. Conformance audit (ARCH-###) confirms the above.

Until then, status remains **Architecture Design — NOT FROZEN**.

---

# 15. Conformance

1. Every Phase E dependency/interaction document must cite E-001…E-004, AI-TOS-000, and Platform Architecture v1.0 (SA-000…SA-015).  
2. Dependencies/interactions must not redefine higher constitutions.  
3. Dependencies/interactions must not create SA-016 or absorb ATI capabilities.  
4. Non-conformance is a defect.

**Conformance sentence:**

> This work conforms to AI-TOS-000, UAIA v1.0, ATI Constitution, DDD Constitution, PRODUCT Constitution, Platform Architecture v1.0 (SA-000…SA-015), E-001, E-002, E-003, and E-004 AI-TOS Reference Dependency and Interaction Model; it does not redefine them.

---

# 16. Freeze Recommendation

**Recommendation:** Accept **E-004** as the Architecture Design dependency and interaction model for Phase E.  
**Status remains:** Architecture Design — **NOT FROZEN**.

**Effect of acceptance (not freeze):**

- Phase E may use these dependency/interaction patterns to relate P0–P8 and ATI/Product boundaries.  
- No ownership transfer is authorized by dependency or interaction.  
- No technology/protocol freeze is authorized by sync/async posture.  
- No universal coordinator is authorized to resolve cycles.  
- Freeze requires satisfying §14 Freeze Criteria via Board action.

**Board posture:**

Depend without owning.  
Interact without seizing.  
Fail without rewriting meaning.  
Connect ATI as consumer — never as Platform owner.

---

## End of E-004

**Dependencies support. Interactions exchange. Ownership stays. Cycles of ownership are rejected. Universal coordination is forbidden.**
