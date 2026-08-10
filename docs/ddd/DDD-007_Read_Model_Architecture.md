# DDD-007

# Read Model Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 · DDD-003 · DDD-004 · DDD-005 · DDD-006 (all FROZEN)  
**Non-scope:** Software, databases, SQL, APIs, persistence technology, implementation, redesign of parents  

**Mission:** Freeze the constitutional meaning of Read Models for ATI — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is a Read Model constitutionally?

A **Read Model** is a purpose-built, non-authoritative business projection optimized to answer a defined class of questions, derived from one or more Aggregates’ published meanings (typically via Domain Events / Published Language), owned by a Bounded Context, and incapable of changing authoritative business state by itself.

### 2. What is NOT a Read Model?

Not an Aggregate · not a Fact · not Understanding (the UAIA belief-state) · not a Decision · not an Intent · not a Command · not a Domain Event · not a database table · not a SQL view-as-constitution · not an API · not a UI screen · not Memory-as-identity · not Activated Competence.

### 3. Why do Read Models exist?

To allow asking and answering business questions **without mutating Aggregates**, without forcing foreign contexts to read private Aggregate internals, and without overloading authoritative write models with every query shape.

### 4. Who owns Read Models?

The **Bounded Context that publishes the Read Model’s language** owns that Read Model family. Ownership follows DDD-001/002. A context may own Read Models that project **its own** Aggregates and, via DDD-003, may compose **Published Language** from upstream contexts — without owning those upstream Aggregates.

### 5. What is the relationship between Aggregates and Read Models?

Aggregates are **authoritative consistency boundaries** (DDD-004).  
Read Models are **derived projections**.  
Aggregates change via Commands; successful changes emit Domain Events; Read Models may be updated from published occurrences — they never write Aggregates.

### 6. Can Read Models change business state?

**Never.**  
They are read-only as to authoritative meaning. Correcting a Read Model refreshes projection; it does not invent business truth.

### 7. Can one Read Model combine information from multiple Aggregates?

**Yes**, if and only if it combines **Published Language / published event meanings** (same context or upstream published forms under DDD-003), and remains explicit that the composition is a **projection**, not a new Aggregate and not a Shared Kernel of write authority.

### 8. What information belongs in a Read Model?

Only information needed to answer its declared question class: projected attributes, citation references to Aggregate/Event/Fact/Understanding revision identities, freshness/as-of of the projection, and composition labels that preserve ownership of source meanings.

### 9. What must never belong in a Read Model?

Authoritative write logic · Command issuance power · Aggregate invariant enforcement · private foreign model dumps · Fact admission authority · Decision/Intent authority · Learning activation · silent redefinition of upstream terms · transport/SQL/API artifacts-as-meaning  

### 10. What architectural laws govern Read Models?

See §§2–9. Supreme laws: Aggregates remain authoritative; Read Models never mutate state; composition uses Published Language; UAIA/ATI Must-Never-Overlap preserved; Understanding is not demoted to “just a dashboard read model.”

---

# 1. Definition

**ATI Read Model Architecture** defines Read Models as owned, non-authoritative business projections for answering questions, derived from Aggregates’ published meanings, subordinate to DDD-001…006 and UAIA/ATI constitutions.

**Constitutional sentence:**

> Aggregates hold write authority and invariants. Read Models answer questions. Understanding remains the cognitive belief-state. Dashboards may use Read Models; they do not replace Understanding, Facts, or Decisions.

---

# 2. Constitutional Principles

**RM-P1 Projection, Not Authority** — Read Models never own business write truth.  

**RM-P2 Purpose-Bound** — Each Read Model serves a declared question class.  

**RM-P3 Context Ownership** — Each Read Model family has one owning Bounded Context.  

**RM-P4 Published Derivation** — Derivation uses Aggregates’ Domain Events / Published Language — not private internals.  

**RM-P5 No State Mutation** — Read Models cannot accept Commands that change Aggregates.  

**RM-P6 Composition Honesty** — Multi-source Read Models remain projections with source citations.  

**RM-P7 Freshness Honesty** — Projection as-of / staleness must be expressible.  

**RM-P8 Language Bound** — Read Model terms follow DDD-002; no silent homonyms.  

**RM-P9 Cognition Non-Collapse** — Read Model ≠ Understanding ≠ Fact ≠ Decision.  

**RM-P10 Constitution Conformity** — Must-Never-Overlap pairs remain uncollapsed in projections.

---

# 3. Read Model Identity

1. Each Read Model type has a name in the owning Ubiquitous Language stating what question class it answers.  
2. Each Read Model instance has identity appropriate to that question class.  
3. Identity of projected Aggregates/Events remains **citation**, not capture of ownership.  
4. Projection identity is not a table primary key constitutionally.  
5. Rebuilding a projection does not mint new business occurrences (Domain Events) unless an Aggregate actually changed.

---

# 4. Ownership

1. Owning Bounded Context defines and stewards the Read Model family.  
2. Upstream contexts do not lose Aggregate ownership when projected.  
3. Downstream contexts may Conformist-consume Published Read Model language or translate via Anti-Corruption (DDD-003).  
4. No dual semantic ownership of the same Read Model definition.  
5. Cross-context composite Read Models require explicit Published Language inputs and citation of all owners.

---

# 5. Aggregate Relationship

| Rule | Statement |
|---|---|
| Authority | Aggregates are authoritative; Read Models are derived |
| Update motivation | Published Domain Events / Published Language changes may refresh projections |
| Commands | Commands target Aggregates only (DDD-006), never Read Models as write authorities |
| Invariants | Aggregate invariants are not enforced by Read Models |
| Opacity | Read Models must not require reading Aggregate private internals |
| Failure | Stale/incorrect projection is a projection defect — not license to rewrite Aggregates from the Read Model |

---

# 6. Composition Rules

1. A Read Model may project **one** Aggregate family’s published meaning.  
2. A Read Model may compose **multiple** Aggregates’ published meanings when the question class requires it.  
3. Composition must label source ownership (citations).  
4. Composition must not create a write-side Shared Kernel.  
5. Composition across Bounded Contexts must obey DDD-003 (Published Language / translation).  
6. Composing Decision + Execution + Outcome into one “Trade God Read Model” that becomes the enterprise language of record is **forbidden** as ownership collapse — a dashboard projection may exist only if it remains non-authoritative and cites owners.  
7. Market Understanding and Agent Situation may be **cited** in Read Models; the Read Model does not become Understanding.

---

# 7. Invariants

1. Read Models never change authoritative business state.  
2. Each Read Model family has one owning Bounded Context.  
3. Derivation uses published meanings only.  
4. Multi-source projections preserve source citations.  
5. Read Model ≠ Aggregate ≠ Fact ≠ Understanding ≠ Decision ≠ Intent ≠ Outcome ≠ Experience.  
6. Freshness/as-of of projections must be honest.  
7. Forbidden vocabulary (DDD-002) remains forbidden in Read Model naming.  
8. SQL/API/DB shapes never define Read Model constitution.  
9. UAIA/ATI separations survive projection.  
10. Correcting projections does not emit Domain Events of Aggregate change.

---

# 8. Forbidden Patterns

1. Using a Read Model as the system of record  
2. Issuing Commands “against” a Read Model as Aggregate substitute  
3. Treating Understanding as merely a Read Model  
4. Treating Facts as Read Models (or vice versa)  
5. Private Aggregate scraping to build projections  
6. Dual-owned enterprise “Position Read Model” that redefines Inventory and Execution  
7. Projection that silently merges Execution and Outcome languages  
8. Projection that presents Opportunity as Market Understanding  
9. Shared Kernel write model disguised as a Read Model  
10. Persistence technology defining Read Model meaning  
11. Assuming projection freshness equals Understanding freshness without stating as-of  
12. Downstream redefining upstream Read Model semantics  

---

# 9. Must Never Overlap

| Term A | Term B |
|---|---|
| Read Model | Aggregate |
| Read Model | Fact |
| Read Model | Understanding (belief-state authority) |
| Read Model | Decision |
| Read Model | Intent / Action / Execution |
| Read Model | Outcome / Experience / Learning |
| Read Model | Command |
| Read Model | Domain Event (events may feed projections; they are not projections) |
| Read Model | Database / SQL / API |

**Clarifying note (non-new concept):**  
ATI dashboards may display Read Models that **present** Market Understanding or Agent Situation revision citations. The cognitive authority remains Understanding strata (BC-04/BC-05). The Read Model is a projection for answering/displaying questions — never the belief-state itself.

---

# 10. Freeze Recommendation

**Status: FROZEN**

DDD-007 freezes Read Model constitutional law for ATI.

**Conformance sentence:**

> This work conforms to DDD-007 Read Model Architecture under UAIA, ATI Constitution, and DDD-000…006; it does not redefine them.

Breaking changes require DDD-007 major version and board approval.

Catalogs of specific Read Models per Bounded Context may follow later; they must obey DDD-007 and DDD-002.

---

## End of DDD-007

**Aggregates write. Events declare. Read Models answer. Understanding believes. Never swap authority for convenience.**
