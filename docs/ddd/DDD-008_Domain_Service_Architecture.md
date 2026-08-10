# DDD-008

# Domain Service Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 · DDD-003 · DDD-004 · DDD-005 · DDD-006 · DDD-007 (all FROZEN)  
**Non-scope:** Software, microservices, APIs, dependency injection, persistence, implementation, redesign of parents  

**Mission:** Freeze the constitutional meaning of Domain Services for ATI — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is a Domain Service constitutionally?

A **Domain Service** is a stateless business operation, expressed in a Bounded Context’s Ubiquitous Language, that performs domain behavior which **does not naturally belong to a single Aggregate**, while still obeying Aggregate boundaries, Command/Event laws, and context ownership.

### 2. What is NOT a Domain Service?

Not an Aggregate · not a Bounded Context · not a microservice · not an API · not an Application Service (orchestration outside domain meaning) · not a Repository · not a Read Model · not UAIA Reasoning · not Control · not a Decision · not an Intent · not a Fact mint · not a dump for all logic that “didn’t fit.”

### 3. Why do Domain Services exist?

Because some genuine business behaviors are **operations over multiple Aggregate identities or pure domain calculations** that would distort Aggregate boundaries if forced into one Root — yet must remain in domain language, not leak into technology services.

### 4. When should behavior belong to a Domain Service instead of an Aggregate?

Place behavior in a Domain Service when **all** hold:

1. The behavior is meaningful in Ubiquitous Language.  
2. It does not naturally enforce one Aggregate’s local invariants alone.  
3. Forcing it into one Aggregate would inflate that Aggregate or create foreign mutation.  
4. It coordinates by issuing Commands to Roots / interpreting published meanings — not by writing internals.

If behavior enforces one Aggregate’s invariants, it belongs **in that Aggregate**.

### 5. Who owns Domain Services?

The **Bounded Context** whose Ubiquitous Language names the operation owns the Domain Service. Ownership follows DDD-001/002. No dual ownership.

### 6. Can a Domain Service own business state?

**No.**  
Domain Services are **stateless** as to authoritative business state. State lives in Aggregates (and constitutional Understanding strata via their owning contexts’ models). Services may use transient calculation values during an operation; they do not own durable business state.

### 7. Can a Domain Service modify multiple Aggregates?

**Only by issuing multiple Commands** (or equivalent Root-gated operations) under an explicit process — never by direct multi-Aggregate internal writes.  
One Domain Service invocation may orchestrate a **domain process** across Aggregates while respecting DDD-004/006.

### 8. What relationship exists between Domain Services and Domain Events?

Domain Services do **not** replace Aggregates as Event owners.  
Aggregates emit Domain Events on successful transitions (DDD-005).  
A Domain Service may cause transitions (via Commands) that result in Events; it does not publish another Aggregate’s Events, and it does not emit “service events” as substitutes for Aggregate Domain Events.

### 9. What must never be placed inside a Domain Service?

Authoritative business state · Aggregate invariant ownership stolen from Roots · Fact admission authority · Understanding belief authority · Decision selection authority · Intent/Action/Execution identity · Learning activation · private foreign model mutation · API/microservice concerns · Read Model write authority · Reasoning Workspace as a Domain Service dump  

### 10. What architectural laws govern Domain Services?

See §§2–9. Supreme laws: Aggregates own state/invariants/events; Commands gate change; Contexts own language; UAIA/ATI separations intact; Domain Services are rare, named, stateless domain operations — not a junk drawer.

---

# 1. Definition

**ATI Domain Service Architecture** defines Domain Services as context-owned, stateless, language-bound domain operations used only when behavior cannot honestly live inside one Aggregate, subordinate to DDD-001…007 and UAIA/ATI constitutions.

**Constitutional sentence:**

> Aggregates protect state and invariants. Domain Services perform domain operations that span or calculate beyond a single Aggregate — without owning state and without becoming microservices.

---

# 2. Constitutional Principles

**DS-P1 Statelessness** — Domain Services own no authoritative business state.  

**DS-P2 Language Bound** — Named in Ubiquitous Language of one Bounded Context.  

**DS-P3 Exceptional Use** — Prefer Aggregate behavior; use Domain Services only when Aggregate placement would be dishonest.  

**DS-P4 Root Respect** — Multi-Aggregate effects go through Commands/Roots only.  

**DS-P5 No Event Theft** — Domain Events remain Aggregate-emitted.  

**DS-P6 No Cognition Dump** — Domain Service ≠ Reasoning ≠ Decision ≠ Control.  

**DS-P7 Context Ownership** — One owner context per Domain Service.  

**DS-P8 Process Honesty** — Cross-Aggregate coordination is an explicit domain process, not hidden dual writes.  

**DS-P9 Published Inputs** — Cross-context inputs via Published Language / translation (DDD-003).  

**DS-P10 Constitution Conformity** — Must-Never-Overlap preserved.

---

# 3. Identity

1. Each Domain Service has a business name in the owning Ubiquitous Language.  
2. Identity is the **operation’s meaning**, not a class name, bean name, or deployable name.  
3. Domain Service identity does not replace Aggregate identity.  
4. Technical service identity is non-constitutional.

---

# 4. Ownership

1. Owning Bounded Context defines and stewards the Domain Service.  
2. Other contexts may invoke only through Published Language / lawful processes — they do not co-own the service meaning.  
3. No Shared Kernel of universal Domain Services across all BCs.  
4. Ownership includes preconditions/postconditions expressed in local language — not Aggregate state ownership.

---

# 5. Aggregate Relationship

| Rule | Statement |
|---|---|
| Default home of behavior | Aggregate Root |
| Domain Service use | When behavior is not naturally one Aggregate’s |
| State | Remains in Aggregates |
| Modification | Only via Commands to Roots (DDD-006) |
| Invariants | Enforced by Aggregates on accept |
| References | Services may reference Aggregate identities; never embed writable foreign internals |
| Refusal | If a Command is refused, the Domain Service cannot force the transition |

---

# 6. Domain Event Relationship

| Rule | Statement |
|---|---|
| Emission | Aggregates emit Domain Events |
| Services | May trigger Commands that lead to Events |
| Forbidden | Service publishing another Aggregate’s Domain Event |
| Forbidden | “Integration event from service” replacing Domain Event ownership |
| Facts | Domain Services do not mint Facts; Evidence Registry ownership remains BC-03 |

---

# 7. Invariants

1. Domain Services are stateless as to authoritative business state.  
2. Each Domain Service has one owning Bounded Context.  
3. Domain Services do not bypass Aggregate Roots.  
4. Multi-Aggregate change = multiple Commands under explicit process.  
5. Domain Events remain Aggregate-owned.  
6. Domain Service ≠ microservice ≠ API ≠ Application Service (constitutional distinction).  
7. Domain Service ≠ UAIA Reasoning/Decision/Intent.  
8. Read Models are not updated authoritatively by Domain Services as write models.  
9. Forbidden vocabulary remains forbidden in Domain Service naming (DDD-002).  
10. UAIA/ATI separations remain intact.

---

# 8. Forbidden Patterns

1. “Domain Service” as synonym for microservice  
2. Putting all business logic into Domain Services  
3. Stateful Domain Services owning Inventory/Decisions/Facts  
4. Domain Service directly mutating multiple Aggregate internals  
5. Domain Service emitting foreign Domain Events  
6. Domain Service minting Facts or Understanding beliefs  
7. Domain Service selecting Decisions or creating Intents by collapsing cognition  
8. Domain Service activating Learning competence  
9. Using Domain Service to avoid modeling Aggregates  
10. Shared Kernel mega-service used by all contexts  
11. Dependency-injection architecture presented as Domain Service constitution  
12. API endpoint = Domain Service identity  

---

# 9. Must Never Overlap

| Term A | Term B |
|---|---|
| Domain Service | Aggregate |
| Domain Service | Bounded Context |
| Domain Service | Microservice / API |
| Domain Service | Application Service (tech orchestration outside domain meaning) |
| Domain Service | Reasoning / Decision / Intent |
| Domain Service | Fact / Understanding |
| Domain Service | Domain Event ownership |
| Domain Service | Read Model (authority) |
| Domain Service | Repository / persistence |

**Clarifying notes (non-new concepts):**

- **Application Service** (when spoken of later) orchestrates use-case flow outside this constitution’s domain meaning; it must not steal Ubiquitous Language operations that are true Domain Services, and must not become the home of invariants.  
- **UAIA Reasoning** deliberates; it is not a DDD Domain Service. Deliberation BC may *use* Domain Services for domain calculations, but Reasoning remains cognitive constitution.

---

# 10. Freeze Recommendation

**Status: FROZEN**

DDD-008 freezes Domain Service constitutional law for ATI.

**Conformance sentence:**

> This work conforms to DDD-008 Domain Service Architecture under UAIA, ATI Constitution, and DDD-000…007; it does not redefine them.

Breaking changes require DDD-008 major version and board approval.

Catalogs of specific Domain Services per Bounded Context may follow later; they must remain rare, named, stateless, and Aggregate-respecting.

---

## End of DDD-008

**Aggregates hold state. Services calculate or coordinate without owning state. Events still belong to Aggregates. Microservices are irrelevant here.**
