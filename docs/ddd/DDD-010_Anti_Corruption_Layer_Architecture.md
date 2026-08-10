# DDD-010

# Anti-Corruption Layer Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 · DDD-003 · DDD-004 · DDD-005 · DDD-006 · DDD-007 · DDD-008 · DDD-009 (all FROZEN)  
**Non-scope:** Software, adapters-as-code, HTTP, APIs, infrastructure, persistence, implementation, redesign of parents  

**Mission:** Freeze the constitutional meaning of the Anti-Corruption Layer (ACL) for ATI — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is an Anti-Corruption Layer constitutionally?

An **Anti-Corruption Layer** is a semantic boundary that translates foreign or informal meaning into a Bounded Context’s Ubiquitous Language (and, when needed, translates outward without leaking private models) so that external systems and other contexts **cannot redefine** ATI’s owned meanings.

It is a **meaning firewall**, not a technical adapter product.

### 2. What is NOT an Anti-Corruption Layer?

Not an API gateway · not an HTTP client · not a broker SDK wrapper-as-constitution · not a database · not a microservice · not a Shared Kernel · not Conformist adoption · not a place to hide domain rules · not UAIA Reasoning · not a license to mint Facts/Decisions.

### 3. Why does ATI require one?

Because brokers, venues, vendors, media, legacy platforms, and even neighboring Bounded Contexts speak foreign or colliding languages. Without ACL discipline, ATI’s Ubiquitous Language, Aggregates, and UAIA/ATI separations corrupt into vendor speech (“order,” “position,” “signal,” “risk”).

### 4. Which external systems must never redefine ATI language?

All of them — including but not limited to:

- Brokers / custodians / OMS vendors  
- Exchanges / market-data vendors  
- News/social publishers  
- Cloud/AI vendors  
- AI-TOS platform mechanics (platform may serve ATI; it does not redefine ATI/UAIA terms)  
- Partner analytics / “signal” providers  
- Any foreign Bounded Context’s **private** model  

External systems may supply Reality/channels/publications; they do not own ATI definitions (DDD-002).

### 5. What kinds of translation are legal?

| Legal translation | Meaning |
|---|---|
| Foreign term → owned Ubiquitous Language term | Inbound protection |
| Owned Published Language → foreign required form | Outbound without leaking private model |
| Homonym qualification (DDD-002) | Collision resolution |
| Citation mapping of identities | Reference without capture |
| Refusal / quarantine of untranslatable meaning | Integrity |

### 6. What must never cross the boundary unchanged?

Vendor “order/position/risk/signal” speech into ATI official language · private Aggregate dumps · foreign Decision/Intent substitutes · unvalidated publications treated as Understanding · Execution reports treated as Outcomes · dual-meaning bare terms · Commands/Events that redefine owners  

### 7. Can external models become internal models?

**Never automatically.**  
External models may motivate Observation → Facts → Assimilation / Commands inside ATI. They do not become Aggregates, Understanding, or Decisions by import.

### 8. Can internal models leak outward?

**Private models must not leak.**  
Only **Published Language** (and outbound translations of published forms) may leave a context. ACL outbound translation exposes only what the owner deliberately publishes.

### 9. Who owns translation?

The **Bounded Context being protected** owns its ACL translations into its Ubiquitous Language.  
Upstream owners own Published Language definitions; ACL must not redefine them — only map foreign speech to local lawful consumption.

### 10. What architectural laws govern the ACL?

See §§2–9. Supreme laws: DDD-002 single meaning/owner; DDD-003 mandatory ACL postures; DDD-001 no dual ownership; UAIA/ATI Must-Never-Overlap; no private-model reach-in; no tech definition of ACL.

---

# 1. Definition

**ATI Anti-Corruption Layer Architecture** defines ACLs as context-owned semantic firewalls that translate foreign and informal meaning into (and published meaning out of) Bounded Contexts without allowing external systems or foreign private models to redefine ATI language or collapse constitutional separations.

**Constitutional sentence:**

> Foreign speech stops at the ACL. Inside, only Ubiquitous Language rules. Outside, only Published Language leaves.

---

# 2. Constitutional Principles

**ACL-P1 Meaning Firewall** — Protects language and models from corruption.  

**ACL-P2 Context Ownership** — Each protected Bounded Context owns its inbound translation into its language.  

**ACL-P3 No Redefinition** — ACL maps; it does not redefine upstream Published Language or UAIA/ATI terms.  

**ACL-P4 Mandatory Where Risk Exists** — Required at edges named by DDD-003 (and any foreign-system edge).  

**ACL-P5 Inbound Strictness** — Untranslatable meaning is refused or quarantined — not silently adopted.  

**ACL-P6 Outbound Minimalism** — Only Published Language (or its deliberate outbound translation) exits.  

**ACL-P7 No State Authority** — ACL owns no Aggregates, Facts, Understanding, Decisions.  

**ACL-P8 Citation Not Capture** — Foreign identities become citations/references after translation — not co-owned entities.  

**ACL-P9 Homonym Discipline** — DDD-002 qualifications enforced at the boundary.  

**ACL-P10 Constitution Conformity** — Must-Never-Overlap cannot be bypassed by “vendor says so.”

---

# 3. Boundary Rules

1. Every Bounded Context has a semantic exterior and interior.  
2. Foreign/private meaning crosses inward only through ACL translation into local Ubiquitous Language.  
3. Conformist consumption applies only to **Published Language** of an upstream owner — still without redefinition.  
4. External systems never sit “inside” a context’s model.  
5. Mandatory ACL postures from DDD-003 remain in force:  
   - BC-07 ← BC-04/BC-05  
   - BC-08 ← BC-07  
   - BC-10 ← BC-09  
   - BC-05 ↔ BC-09  
   - BC-06 ↔ BC-12  
6. Broker/venue/vendor edges into Sensing/Evidence/Enactment always require ACL into ATI language.  
7. Boundaries are meaning boundaries — not network boundaries.

---

# 4. Translation Rules

1. Translate **foreign term → owned term** using DDD-002 ownership table.  
2. Bare vendor “position/order/risk/signal” **never** enter as official ATI terms.  
3. Map to qualified forms: Inventory · Intent/Action/Execution · Constraint Definition/Utilization/Fragility · Opportunity Judgment/Alternative/Decision as lawful.  
4. Preserve Fact vs Percept vs Outcome vs Experience distinctions under translation.  
5. Outbound: translate only Published Language into foreign required labels when necessary — do not export Reasoning Workspace private jargon or Aggregate internals.  
6. Translation failure ⇒ do not pretend Conformist success.  
7. Translation must not mint Facts, Decisions, or Understanding beliefs by itself — it only produces lawful local speech for subsequent Observation/Command/process paths.

---

# 5. Ownership

1. Protected Bounded Context owns its ACL meaning rules.  
2. Upstream Published Language remains owned by the publisher.  
3. External systems own their foreign models — never ATI definitions.  
4. No dual ownership of a translated concept’s definition.  
5. Application Services may orchestrate use cases that *traverse* ACL boundaries; they do not own ACL semantics (DDD-009).

---

# 6. External Relationship Rules

| External / foreign source | ACL duty |
|---|---|
| Broker / custodian speech | Translate to Sensing/Enactment/Ledger ATI terms; never redefine Inventory/Intent/Execution |
| Venue / market-data vendor | Translate to Percept/Reference language; never import “vendor market state” as Understanding |
| News / social | Translate to Publication/Claim percept language; never to world-state Understanding by fiat |
| Signal/alpha vendors | Refuse as Decision/Intent; at most foreign input quarantined — not Opportunity-in-Understanding |
| Other BC private models | Opaque; only Published Language or translated published forms |
| AI-TOS platform mechanics | May enable ATI; must not rename UAIA/ATI concepts |

External Reality remains Reality (ATI-001). ACL protects **language and models**, not the existence of the outside world.

---

# 7. Invariants

1. ACL is a semantic firewall, not a technical adapter constitution.  
2. Each protected context owns inbound translation into its Ubiquitous Language.  
3. External systems never redefine ATI language.  
4. Private models never leak outward.  
5. Published Language may leave; private dumps may not.  
6. Untranslatable meaning does not enter as official speech.  
7. ACL does not own business state or cognitive authority.  
8. ACL does not emit foreign Aggregates’ Domain Events or mint Facts.  
9. DDD-002 forbidden vocabulary remains forbidden across the boundary.  
10. UAIA/ATI Must-Never-Overlap cannot be violated by translation convenience.

---

# 8. Forbidden Patterns

1. “Pass-through” vendor model as ATI Ubiquitous Language  
2. Treating ACL as API gateway/HTTP client constitution  
3. Shared Kernel with broker “Position/Order” objects  
4. Importing signals as Decisions/Intents  
5. Importing fills as Outcomes without Consequence language  
6. Exporting Reasoning Workspace or Aggregate internals  
7. Using ACL to redefine upstream Published Language  
8. Silent Conformist adoption of private foreign models  
9. Dual-owned “canonical enterprise model” behind the ACL  
10. Minting Understanding beliefs inside ACL translation  
11. Using ACL to bypass Evidence Registry / Decision Authority / Governance  
12. Claiming no ACL is needed because “we all use the same JSON”

---

# 9. Must Never Overlap

| Term A | Term B |
|---|---|
| Anti-Corruption Layer | API / HTTP / adapter code |
| Anti-Corruption Layer | Shared Kernel |
| Anti-Corruption Layer | Conformist (distinct patterns) |
| Anti-Corruption Layer | Aggregate / Domain Service / Application Service (may be *used by* processes; ACL is not those roles) |
| Foreign model | ATI Ubiquitous Language identity |
| Vendor “order/position/risk/signal” | Decision / Intent / Inventory / Fragility / Opportunity Judgment |
| ACL translation | Fact admission / Decision selection / Learning activation |
| Published Language outbound | Private model leak |

---

# 10. Freeze Recommendation

**Status: FROZEN**

DDD-010 freezes Anti-Corruption Layer constitutional law for ATI.

**Conformance sentence:**

> This work conforms to DDD-010 Anti-Corruption Layer Architecture under UAIA, ATI Constitution, and DDD-000…009; it does not redefine them.

Breaking changes require DDD-010 major version and board approval.

---

## End of DDD-010

**Translate to own the language. Publish only what you mean. Never let vendors write the constitution.**
