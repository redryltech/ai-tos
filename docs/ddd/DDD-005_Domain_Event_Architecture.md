# DDD-005

# Domain Event Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 · DDD-003 · DDD-004 (all FROZEN)  
**Non-scope:** Software, event buses, messaging, Kafka, APIs, implementation, redesign of parents, transport topology  

**Mission:** Freeze the constitutional meaning of Domain Events for ATI — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is a Domain Event constitutionally?

A **Domain Event** is an immutable business occurrence record that an Aggregate emits when a meaningful state transition succeeds inside that Aggregate — expressed in the owning Bounded Context’s Ubiquitous Language — declaring that something of business significance **has occurred** in that model.

### 2. What is NOT a Domain Event?

Not a Fact (Evidence Registry) · not an Observation/Percept · not an Outcome Stream element · not an Experience · not a Candidate Improvement · not a Decision · not a technical bus message · not a log line · not a database trigger · not a UI notification · not a command · not a request/response.

### 3. Why do Domain Events exist?

To make Aggregate state transitions explicit in business language, to allow other models to react without reading private Aggregate internals, and to preserve causal history of business change inside a Bounded Context’s meaning.

### 4. When does a Domain Event occur?

Only **after** a successful Aggregate Root operation that completes a meaningful transition while preserving the Aggregate’s invariants. Failed/refused transitions emit no success Domain Event.

### 5. Who owns a Domain Event?

The **emitting Aggregate** (and thus its owning Bounded Context) owns the event’s definition, identity family, and meaning (DDD-004).

### 6. Can multiple Aggregates publish the same Domain Event?

**No.**  
One Domain Event type/meaning has one owning Aggregate type. Others may publish **different** events that downstream translators correlate — never the same owned event definition.

### 7. Can one Aggregate publish another Aggregate’s event?

**Never.**

### 8. What must every Domain Event contain?

- Event name in Ubiquitous Language  
- Occurrence time (business as-of)  
- Identity of the emitting Aggregate  
- Event identity (unique occurrence identity)  
- Essential business payload sufficient to understand what occurred **in published form**  
- Causation/order cues within the Aggregate’s lifecycle where required for meaning  

### 9. What must never be inside a Domain Event?

Foreign Aggregate internals · private model dumps · redefined foreign concepts · commands disguised as events · transport headers-as-meaning · persistence IDs-as-business-identity · collapse of Must-Never-Overlap pairs · speculative future intentions presented as occurrences  

### 10. What relationships exist between Aggregates and Domain Events?

Aggregate **emits** Domain Events on its transitions.  
Domain Events **never mutate** Aggregates by themselves.  
Other Aggregates change only through their own Roots’ operations, possibly *motivated* by knowledge of published events via Context Map patterns (DDD-003).

---

# 1. Definition

**ATI Domain Event Architecture** defines Domain Events as immutable, Aggregate-owned records of successful business state transitions within a Bounded Context, subordinate to UAIA/ATI meaning and DDD-001…004 laws.

**Constitutional sentence:**

> A Domain Event states that a business occurrence has happened in an Aggregate’s language. It is not evidence admission, not outcome accounting, not a message technology, and not a license to reach into foreign models.

---

# 2. Constitutional Principles

**DE-P1 Occurrence, Not Request** — Domain Events record what happened; they are not commands.  

**DE-P2 Aggregate Emission** — Only the owning Aggregate emits its Domain Events.  

**DE-P3 Success Gate** — Events follow successful invariant-preserving transitions.  

**DE-P4 Immutability of Meaning** — An emitted occurrence’s business meaning is not silently rewritten.  

**DE-P5 Language Bound** — Event names and payloads use owning Ubiquitous Language (DDD-002).  

**DE-P6 Published Form** — Cross-context reaction uses Published Language forms, not private payloads.  

**DE-P7 No Foreign Emission** — No Aggregate emits another Aggregate’s events.  

**DE-P8 No Dual Ownership** — One event meaning → one Aggregate owner.  

**DE-P9 Separation from Facts** — Domain Events ≠ Facts.  

**DE-P10 Constitution Conformity** — Events must not collapse UAIA/ATI Must-Never-Overlap meanings.

---

# 3. Domain Event Identity

1. Each Domain Event occurrence has a unique **event occurrence identity**.  
2. Each Domain Event type has a name in the owning context’s Ubiquitous Language.  
3. Identity of the emitting Aggregate is part of the event’s business identity context.  
4. Downstream contexts cite event occurrence identity via Published Language; they do not redefine the event type.  
5. Event identity is business identity — not a broker offset, not a queue id, not a row id.

---

# 4. Event Ownership

1. Owning Aggregate defines and emits the event.  
2. Owning Bounded Context (DDD-001) is the semantic steward of that event family.  
3. Consumers may subscribe in business terms only to **Published** event forms.  
4. Consumers never become co-owners of the event definition.  
5. Correlation across contexts uses translation/citation — not shared ownership of one event type.

---

# 5. Aggregate Relationship

| Rule | Statement |
|---|---|
| Emission | Aggregate Root successful transition → Domain Event(s) |
| Scope | Events speak only transitions of that Aggregate |
| Mutation | Events do not write Aggregates; Roots do |
| Cross-Aggregate | Peer Aggregates never emit each other’s events |
| Cross-Context | Reactions only through DDD-003 patterns on published meanings |
| Invariants | If transition refused, no success Domain Event |

---

# 6. Event Publication Rules

1. Publication means making an event’s **Published Language form** available to allowed downstream consumers (business publication — not a bus product).  
2. Private/internal notations are not Published Language.  
3. Publication does not transfer ownership.  
4. Upstream owes semantic stability of published event meanings (DDD-003).  
5. Breaking published event meaning is a constitutional version event.  
6. Multiple events may be emitted from one transition if each names a distinct business occurrence.  
7. Ordering meaningful within an Aggregate’s lifecycle must be expressible in business terms when required for correctness of meaning.  
8. Publication never includes foreign private internals.

---

# 7. Event Invariants

1. Domain Events are immutable as occurrence records of meaning.  
2. Only owning Aggregates emit their events.  
3. Events follow successful transitions only.  
4. Event types have single Aggregate owners.  
5. Domain Events ≠ Facts ≠ Outcomes ≠ Experiences ≠ Decisions ≠ Commands.  
6. Cross-context use requires Published Language / translation.  
7. No Aggregate mutates another because “an event said so” without its own Root operation.  
8. Event payloads sufficient for published understanding; not entire private models.  
9. Must-Never-Overlap pairs remain uncollapsed in event naming.  
10. Transport/technology never defines Domain Event constitution.

---

# 8. Forbidden Patterns

1. Event storm as excuse for no Aggregates  
2. “Integration events” treated as Domain Events without business ownership  
3. One global event type reused by many Aggregates  
4. Aggregate A publishing Aggregate B’s event  
5. Embedding commands in events  
6. Using Domain Events as Fact substitutes (skipping Evidence Registry)  
7. Naming fills as Outcomes via Domain Events that collapse Execution/Outcome  
8. Deliberation workspace chatter published as Domain Events of Understanding  
9. Learning emitting “Activated” without Governance as if a Domain Event replaces Governance  
10. Downstream rewriting upstream event definitions  
11. Private model dumps inside published events  
12. Treating bus delivery guarantees as Domain Event meaning  

---

# 9. Must Never Overlap

| Term A | Term B |
|---|---|
| Domain Event | Fact |
| Domain Event | Observation / Percept |
| Domain Event | Command / Decision request |
| Domain Event | Outcome (Consequence BC owns Outcome meaning; an Outcome Aggregate may emit its *own* Domain Events — still not identical to Outcome identity) |
| Domain Event | Experience |
| Domain Event | Candidate Improvement |
| Domain Event | Technical message / bus record |
| Event ownership | Multi-Aggregate shared definition |
| Published event form | Private Aggregate dump |

**Clarifying note (non-new concept):**  
A Consequence-context Outcome Aggregate may emit Domain Events such as “Outcome Stream Window Closed.” That Domain Event is owned by the Consequence Aggregate. It is not the Outcome itself, not a Fact, and not an Experience.

---

# 10. Freeze Recommendation

**Status: FROZEN**

DDD-005 freezes Domain Event constitutional law for ATI.

**Conformance sentence:**

> This work conforms to DDD-005 Domain Event Architecture under UAIA, ATI Constitution, and DDD-000…004; it does not redefine them.

Breaking changes require DDD-005 major version and board approval.

Catalogs of specific Domain Event names per Aggregate may follow in later documents; they must obey DDD-005 and DDD-002 language ownership.

---

## End of DDD-005

**Events declare what happened. Aggregates alone emit their events. Facts remain evidence. Outcomes remain consequences. Buses remain non-constitutional.**
