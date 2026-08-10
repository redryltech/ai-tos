# DDD-009

# Application Service Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 · DDD-003 · DDD-004 · DDD-005 · DDD-006 · DDD-007 · DDD-008 (all FROZEN)  
**Non-scope:** Software, REST, APIs, dependency injection, persistence, implementation, redesign of parents  

**Mission:** Freeze the constitutional meaning of Application Services for ATI — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is an Application Service constitutionally?

An **Application Service** is a use-case orchestration boundary that coordinates a business procedure across Aggregates, Domain Services, Commands, Read Models, and Context Map publications — **without owning domain meaning, business state, or cognitive Decision authority**.

It answers: *“How does this use case proceed?”*  
It does not answer: *“What are the domain rules?”* or *“What did ATI decide?”*

### 2. What is NOT an Application Service?

Not a Domain Service · not an Aggregate · not a Bounded Context · not a microservice · not an API/REST endpoint · not UAIA Reasoning · not UAIA Decision · not Intent · not Control · not a Fact mint · not a Read Model · not a place to hide invariants.

### 3. Why do Application Services exist?

To sequence lawful steps of a use case (authorize → command → interpret results → read projections) while keeping Ubiquitous Language rules and invariants inside the domain (Aggregates / Domain Services), and keeping cognitive selection inside UAIA/ATI Decision Authority.

### 4. What is the relationship between Application Services and Domain Services?

| | Application Service | Domain Service |
|---|---|---|
| Kind | Use-case orchestration | Domain operation in Ubiquitous Language |
| State | Owns none | Owns none |
| Rules | Owns **no** business invariants | May perform domain behavior not belonging to one Aggregate |
| Place | Outside domain meaning ownership | Inside Bounded Context domain language |

Application Services may **invoke** Domain Services; they must not **become** Domain Services by absorbing domain rules.

### 5. What is the relationship between Application Services and Aggregates?

Application Services issue **Commands** to Aggregate Roots (DDD-006).  
They never modify Aggregate internals.  
They never replace Roots as invariant enforcers.  
They may read **Published** outcomes via Domain Events’ published forms or Read Models (DDD-005/007) — not private internals.

### 6. Can an Application Service own business rules?

**No** (invariants / Ubiquitous Language domain rules).  
It may own only **use-case sequencing policy** (step order, which Command comes next) that does not redefine domain invariants or cognitive Decisions.

### 7. Can it own business state?

**Never.**

### 8. Can it make business Decisions?

**Never** in the UAIA/ATI sense.  
Cognitive Decisions belong to Decision Authority (BC-08).  
An Application Service may *carry* an already-made Decision/Intent into enactment Commands; it does not select the trading alternative.

### 9. What belongs inside an Application Service?

- Use-case name in business procedure language  
- Sequencing of lawful steps  
- Issuance of Commands to owned/published targets  
- Invocation of Domain Services where appropriate  
- Consumption of Published Language / Read Models for orchestration checks  
- Citation of Decision/Intent/authority identities when required  
- Handling of refusal/acceptance at the procedure level (retry/stop/escalate as process — not inventing domain rules)

### 10. What must never belong inside an Application Service?

Aggregate invariants · Ubiquitous Language domain calculations that are true Domain Services stolen upward · business state · Fact admission · Understanding belief writes · Reasoning deliberation · Decision selection · Intent definition authorship · Learning activation · private model reach-in · API/REST/DI concerns-as-constitution  

---

# 1. Definition

**ATI Application Service Architecture** defines Application Services as context-aligned use-case orchestrators that coordinate Commands, Domain Services, and published reads — without owning domain state, domain invariants, or cognitive Decision/Intent authority.

**Constitutional sentence:**

> Application Services run use cases. Domain Services express domain operations. Aggregates protect state. Decision Authority chooses. Application Services do none of the others’ jobs.

---

# 2. Constitutional Principles

**AS-P1 Orchestration Only** — Sequence lawful steps; do not own domain meaning.  

**AS-P2 Statelessness** — No authoritative business state.  

**AS-P3 Command Path** — Change Aggregates only via Commands.  

**AS-P4 Domain Rules Stay Down** — Invariants in Aggregates; domain ops in Domain Services/Aggregates.  

**AS-P5 Cognition Stays Constitutional** — No Decision/Reasoning ownership.  

**AS-P6 Published Access** — Cross-context orchestration uses DDD-003 Published Language / translation.  

**AS-P7 Context Alignment** — Each Application Service is aligned to a use-case set of one primary Bounded Context (or an explicit process spanning contexts without stealing ownership).  

**AS-P8 Refusal Honesty** — Aggregate refusal is respected; not overridden by orchestration.  

**AS-P9 Read vs Write** — May consult Read Models; never treat them as write authorities.  

**AS-P10 Constitution Conformity** — Preserve UAIA/ATI/DDD Must-Never-Overlap.

---

# 3. Identity

1. An Application Service is identified by its **use-case / procedure name** in business language.  
2. Identity is not an endpoint path, class name, or deployable name.  
3. Application Service identity must not collide with Domain Service or Aggregate Root names in a way that collapses meanings (DDD-002).  
4. Technical hosting identity is non-constitutional.

---

# 4. Ownership

1. Primary ownership aligns with the Bounded Context whose use case is being orchestrated.  
2. Cross-context processes may be orchestrated only with explicit Context Map legality; ownership of Aggregates/Commands/Events remains with defining contexts.  
3. Application Services do not become dual owners of domain terms.  
4. No Shared Kernel of “universal application services” redefining all BC languages.

---

# 5. Aggregate Relationship

| Rule | Statement |
|---|---|
| Mutation | Only through Commands to Roots |
| Internals | Never accessed |
| Invariants | Enforced by Aggregates on Command acceptance |
| Multi-Aggregate use cases | Multiple Commands under explicit process (DDD-004/006/008) |
| Events | Observed via published forms; not fabricated by Application Services |
| Refusal | Stops or branches the use case; cannot force illegal state |

---

# 6. Domain Service Relationship

| Rule | Statement |
|---|---|
| Invocation | Application Service may call Domain Services for true domain operations |
| Distinction | Domain Service remains domain-language operation; Application Service remains use-case orchestration |
| Forbidden | Moving Aggregate invariants into Application Service and calling it a Domain Service |
| Forbidden | Renaming Application Service as Domain Service to bypass DDD-008 rarity rules |
| Statelessness | Both own no authoritative state; different responsibilities |

---

# 7. Invariants

1. Application Services own no business state.  
2. Application Services own no Aggregate invariants.  
3. Application Services do not make UAIA/ATI Decisions.  
4. Application Services do not author Intents as cognitive envelopes (they may issue Commands that enact already-authorized Intents).  
5. Changes go through Commands only.  
6. Cross-context orchestration obeys DDD-003.  
7. Application Service ≠ Domain Service ≠ Aggregate ≠ API.  
8. Read Models may inform orchestration; they do not become systems of record.  
9. Forbidden vocabulary remains forbidden.  
10. UAIA/ATI separations remain intact.

---

# 8. Forbidden Patterns

1. Fat Application Service containing all business rules  
2. Application Service as microservice synonym  
3. Application Service minting Facts or Understanding  
4. Application Service selecting trading Decisions  
5. Application Service creating Intent meaning without Decision Authority  
6. Application Service activating Learning/Governance  
7. Application Service writing multiple Aggregate internals directly  
8. Treating REST controllers as Application Service constitution  
9. Dependency-injection graphs presented as Application Service architecture  
10. Dual-write “orchestration” that bypasses Commands/Events  
11. Using Application Services to avoid modeling Aggregates  
12. Collapsing Domain Service into Application Service  

---

# 9. Must Never Overlap

| Term A | Term B |
|---|---|
| Application Service | Domain Service |
| Application Service | Aggregate |
| Application Service | Bounded Context |
| Application Service | Decision / Reasoning |
| Application Service | Intent (cognitive envelope) |
| Application Service | Command (Application Service *issues* Commands; it is not itself a Command) |
| Application Service | Domain Event |
| Application Service | Fact / Understanding |
| Application Service | Read Model authority |
| Application Service | API / REST / DI container |

**Clarifying note (non-new concept):**  
An Application Service may orchestrate: “given Decision D and Intent I, issue Enactment Commands C1…Cn.” The Decision and Intent remain owned by BC-08/BC-09. The Application Service owns only the use-case sequencing of issuance.

---

# 10. Freeze Recommendation

**Status: FROZEN**

DDD-009 freezes Application Service constitutional law for ATI.

**Conformance sentence:**

> This work conforms to DDD-009 Application Service Architecture under UAIA, ATI Constitution, and DDD-000…008; it does not redefine them.

Breaking changes require DDD-009 major version and board approval.

Catalogs of specific Application Services (use cases) may follow later; they must remain thin orchestrators.

---

## End of DDD-009

**Use cases orchestrate. Domain rules stay in the domain. Cognition stays in UAIA/ATI. Aggregates stay authoritative. APIs stay non-constitutional.**
