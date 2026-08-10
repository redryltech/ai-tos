# DDD-004

# Aggregate Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 · DDD-003 (all FROZEN)  
**Non-scope:** Software, databases, ORMs, persistence, APIs, event buses, implementation, redesign of parents, enumeration of every ATI aggregate instance  

**Mission:** Freeze the constitutional meaning of Aggregates for ATI Bounded Contexts — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is an Aggregate constitutionally?

An **Aggregate** is a consistency boundary inside one Bounded Context: a cluster of domain objects treated as a single unit of change for a set of business invariants, with one Aggregate Root as the sole external gate of modification, and with identity that is meaningful in the owning context’s Ubiquitous Language.

### 2. What is NOT an Aggregate?

Not a database table · not an ORM entity graph · not a microservice · not a Bounded Context · not a UAIA primitive · not a DTO · not “whatever we load together for performance” · not a UI form model · not a shared kernel dump.

### 3. Why do Aggregates exist?

To protect **business invariants** that must hold together, to prevent inconsistent partial updates, to make transactional meaning explicit at the business level, and to stop external parties from reaching into private parts of a model.

### 4. What belongs inside an Aggregate?

Only objects required to enforce that Aggregate’s invariants: Root, internal Entities/Value meanings as needed, and rules that must be true after every successful change to that Aggregate.

### 5. What must never cross Aggregate boundaries?

Direct modification of another Aggregate’s internals · shared mutable identity without ownership · silent invariant coupling across Aggregates · treating two Aggregates as one write unit without an explicit business process above them.

### 6. What is Aggregate ownership?

Each Aggregate is owned by exactly one Bounded Context (DDD-001). That context owns the Aggregate’s language, identity, invariants, and Domain Events it emits.

### 7. Where do invariants live?

**Inside the Aggregate** (local invariants always).  
**Across Aggregates** only as process/policy rules owned by the Bounded Context or higher constitutional law — never as hidden cross-reach mutation.

### 8. Who creates Domain Events?

The **Aggregate** (via its Root’s successful state transitions) creates Domain Events that express business facts of change in that Aggregate’s language. Other Aggregates do not write its events.

### 9. Can one Aggregate modify another Aggregate directly?

**Never.**

### 10. How should Aggregates communicate?

Only through their Roots’ public business operations within a context, and across contexts only via DDD-003 relationships (Published Language / translation) — typically by reacting to Domain Events or explicit business commands at the context edge — never by reaching into foreign internals. (Mechanism tech is out of scope; the **law** is no direct foreign mutation.)

### 11. Can one Entity belong to multiple Aggregates?

**No.** An Entity has one Aggregate home. Other Aggregates may hold references to foreign Aggregate identities, not co-own the Entity.

### 12. How should Aggregate identity be defined?

As a business identity in the owning context’s Ubiquitous Language — stable, unique within the model’s scope, and never redefined by another context. Identity is not a persistence key concept in this constitution.

---

# 1. Definition

**ATI Aggregate Architecture** defines Aggregates as consistency and invariant boundaries within Bounded Contexts, subordinate to UAIA/ATI meaning and DDD-001 ownership, DDD-002 language, and DDD-003 communication laws.

An Aggregate:

- has exactly one **Aggregate Root**;  
- enforces a defined set of **invariants**;  
- owns its **internal structure**;  
- emits **Domain Events** on meaningful transitions;  
- is modified from outside only through the Root’s business operations.

---

# 2. Constitutional Principles

**AG-P1 Consistency Boundary** — Aggregates exist to protect invariants that must hold together.  

**AG-P2 Single Root** — Exactly one Aggregate Root per Aggregate; Root is the only external modification gate.  

**AG-P3 Single Context Owner** — Each Aggregate belongs to exactly one Bounded Context.  

**AG-P4 Language Bound** — Aggregate names, parts, and events use the owning context’s Ubiquitous Language (DDD-002).  

**AG-P5 No Foreign Mutation** — No Aggregate may modify another Aggregate’s internals.  

**AG-P6 Reference, Don’t Capture** — Foreign Aggregates are referenced by identity, never co-owned.  

**AG-P7 Small as Invariants Allow** — Aggregates are as small as possible while still protecting their invariants; not as large as convenient loading.  

**AG-P8 Event Honesty** — Domain Events express true business transitions of that Aggregate; they are not technical notifications.  

**AG-P9 Constitution Conformity** — Aggregates must not collapse UAIA/ATI Must-Never-Overlap meanings.  

**AG-P10 Process Above Aggregates** — Cross-Aggregate business outcomes use explicit processes/policies, never hidden dual writes.

---

# 3. Aggregate Identity

1. Aggregate identity is a **business identity** in the owning Ubiquitous Language.  
2. Identity is unique within the Aggregate type’s defined scope.  
3. Identity is stable across legitimate lifecycle transitions unless the business explicitly ends/supersedes the Aggregate.  
4. Other contexts may store **references** to Aggregate identity via Published Language citation forms — they do not own the identity definition.  
5. Identity is not defined by persistence technology.

---

# 4. Aggregate Ownership

1. DDD-001 Bounded Context = sole semantic owner of its Aggregates.  
2. Ownership includes: Root, internals, invariants, Domain Events, lifecycle language.  
3. No Aggregate may be co-owned by two Bounded Contexts.  
4. Cross-context use is citation/translation only (DDD-003).  
5. UAIA/ATI define cognitive meanings Aggregates must respect; Aggregates do not redefine UAIA/ATI.

---

# 5. Internal Structure

An Aggregate may contain, as needed for its invariants:

| Element | Role |
|---|---|
| **Aggregate Root** | Identity + external gate + invariant enforcer |
| **Internal Entities** | Identity local to the Aggregate; not independently modified from outside |
| **Value meanings** | Immutable descriptive values in local language |
| **Local policies/rules** | Invariant enforcement logic of this Aggregate |

Rules:

- Internal Entities never become external modification entry points.  
- Structure exists for invariant protection, not for mirroring UI or storage.  
- No foreign Aggregate roots embedded as writable internals.

---

# 6. Aggregate Boundaries

## Inside the boundary

- All state required to enforce the Aggregate’s invariants  
- Local transitions and Domain Events of those transitions  

## Outside the boundary

- Other Aggregates  
- Other Bounded Contexts’ models  
- Cognitive constitution (UAIA/ATI) as law — referenced, not redesigned  

## Boundary laws

1. External actors interact only with the Root’s business operations.  
2. Boundary crossing of meaning uses DDD-003 patterns.  
3. A transaction of business meaning that must update two Aggregates is a **process across Aggregates**, not one Aggregate.  
4. “We usually load these together” does not define a boundary.

---

# 7. Invariant Rules

1. **Local invariants** live in the Aggregate and must hold after every successful Root operation.  
2. Aggregates refuse transitions that would break local invariants.  
3. **Cross-Aggregate invariants** are not enforced by reaching into peers; they are enforced by explicit business process/policy in the owning context or constitutional law.  
4. Invariants are expressed in Ubiquitous Language, not storage constraints.  
5. ATI Must-Never-Overlap pairs must not be violated by Aggregate design (e.g., an Aggregate must not own both Decision and Intent meanings as one blended Root ontology; those remain distinct concepts even if related by process).  
6. Constraint **definitions** (Mandate) and Constraint **utilization** (Agent Ledger) remain different Aggregates/contexts — never one invariant soup.

---

# 8. Aggregate Relationships

Legal relationships:

| Relationship | Rule |
|---|---|
| Root → internals | Owns and protects |
| Aggregate → Aggregate (same BC) | By identity reference + process coordination; no direct foreign internal mutation |
| Aggregate → Aggregate (other BC) | Only via Context Map patterns; reference Published identities/events |
| Aggregate → UAIA/ATI concepts | Conformance; no redefinition |

Forbidden relationships:

- Bidirectional writable entanglement of two Aggregates’ internals  
- One Entity shared by two Aggregates  
- Cross-context silent identity merge  

---

# 9. Domain Event Ownership

1. Domain Events are owned by the Aggregate that emits them (and thus by that Aggregate’s Bounded Context).  
2. A Domain Event names a business state transition in local Ubiquitous Language.  
3. Domain Events do not replace Facts (Evidence Registry).  
   - **Fact** = accepted evidentiary commitment (ATI/UAIA Truth).  
   - **Domain Event** = Aggregate-declared business occurrence in a context model.  
4. Downstream contexts may react only through Published Language / translation of those events’ published forms.  
5. No Aggregate may emit Domain Events that redefine another context’s owned concepts.  
6. Domain Events are not technical bus messages in this constitution — they are business occurrences.

---

# 10. Must Never Overlap

| Must not be the same Aggregate / meaning |
|---|
| Bounded Context ↔ Aggregate |
| Aggregate ↔ Database table / ORM graph |
| Aggregate Root ↔ microservice |
| Domain Event ↔ Fact |
| Domain Event ↔ Outcome Stream (unless Consequence BC designs Outcome Aggregates that emit their own events — still not Facts) |
| Decision Aggregate meaning ↔ Intent Aggregate meaning (distinct concepts; related by process BC-08→BC-09) |
| Execution progress ↔ Outcome |
| Experience ↔ Learning Candidate |
| Inventory belief Aggregate ↔ Execution attempt Aggregate |
| Constraint Definition Aggregate ↔ Constraint Utilization Aggregate |

---

# 11. Architecture Invariants

1. Every Aggregate has exactly one Root.  
2. Every Aggregate has exactly one owning Bounded Context.  
3. No direct Aggregate-to-Aggregate internal mutation.  
4. No Entity belongs to multiple Aggregates.  
5. Invariants live primarily in Aggregates; cross-Aggregate rules are explicit processes.  
6. Domain Events are owned by emitting Aggregates.  
7. Domain Events ≠ Facts.  
8. Aggregate design must preserve UAIA/ATI separations.  
9. Aggregate identity is business identity.  
10. Persistence/API/bus concerns never define Aggregates.  
11. Aggregates communicate across contexts only under DDD-003.  
12. This document enumerates laws, not an exhaustive catalog of every ATI Aggregate instance (catalogs may follow in later DDD documents without changing these laws).

---

# 12. Freeze Recommendation

**Status: FROZEN**

DDD-004 freezes Aggregate constitutional law for ATI.

**Conformance sentence:**

> This work conforms to DDD-004 Aggregate Architecture under UAIA, ATI Constitution, and DDD-000…003; it does not redefine them.

Breaking changes require DDD-004 major version and board approval.

Later documents may catalog specific Aggregates per Bounded Context; they must obey DDD-004 and must not invent persistence-driven Aggregates.

---

## End of DDD-004

**Aggregates protect invariants. Roots gate change. Events speak transitions. Never reach across. Never confuse Aggregate with storage or Context.**
