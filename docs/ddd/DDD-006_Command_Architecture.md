# DDD-006

# Command Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 · DDD-003 · DDD-004 · DDD-005 (all FROZEN)  
**Non-scope:** Software, APIs, HTTP, messaging, event buses, persistence, implementation, redesign of parents  

**Mission:** Freeze the constitutional meaning of Commands for ATI — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is a Command constitutionally?

A **Command** is an authoritative business instruction to attempt a specific state transition through one Aggregate Root, expressed in the owning Bounded Context’s Ubiquitous Language, expressing **what should be done** — not what has happened, not what is believed, and not a cognitive Decision by itself.

### 2. What is NOT a Command?

Not a Domain Event · not a Fact · not an Observation · not Understanding · not a Decision · not an Intent (ATI enactment envelope) · not an Outcome · not an Experience · not a query · not an API request · not an HTTP call · not a message envelope · not a UI click.

### 3. Why do Commands exist?

To express directed change attempts against Aggregates in explicit business language, to separate **request to change** from **occurrence of change** (Domain Events), and to keep Aggregate Roots as the only gates of modification (DDD-004).

### 4. Who owns Commands?

The **Bounded Context that owns the target Aggregate** owns the Command types that lawfully address that Aggregate. Command meaning follows Aggregate/Context ownership (DDD-001/002/004).

### 5. What is the relationship between Decision, Intent and Command?

| Concept | Layer | Role |
|---|---|---|
| **Decision** | UAIA/ATI cognition (BC-08) | Selects an alternative (including Abstain) |
| **Intent** | UAIA/ATI enactment envelope (BC-09) | States success-conditioned enactment objective |
| **Command** | DDD operational instruction | Instructs an Aggregate Root to attempt a transition |

Relationships:

- A Decision does **not** equal a Command.  
- An Intent does **not** equal a Command.  
- Fulfilling an Intent may **authorize or require** one or more Commands against Enactment (and related) Aggregates.  
- Other contexts (Evidence, Mandate, Ledger, etc.) also have Commands unrelated to trading Intent.  
- Commands never replace Decision or Intent constitution.

### 6. Can a Command change business meaning?

A Command **proposes/attempts** a transition.  
**Business meaning changes only if** the Aggregate Root accepts the transition and invariants hold — typically emitting Domain Events (DDD-005).  
A rejected Command changes nothing.

### 7. Can one Command affect multiple Aggregates?

**No — not as one Command.**  
One Command targets one Aggregate Root.  
Effects across Aggregates require an explicit **process** issuing multiple Commands (DDD-004 process-above-aggregates).

### 8. Can multiple Commands modify one Aggregate?

**Yes**, over time — sequentially through the Root — provided each respects invariants. Concurrent conflicting Commands are resolved by Aggregate rules; they do not co-write internals bypassing the Root.

### 9. What information must every Command contain?

- Command name in Ubiquitous Language  
- Target Aggregate identity  
- Command occurrence identity  
- Issuance time  
- Essential business parameters required for the attempted transition  
- Authority/issuer reference sufficient for mandate/permission checks in business terms  
- Causation/correlation to upstream business meaning when required (e.g., citation of Decision/Intent identities) — as **citations**, not embedded foreign models  

### 10. What must never appear inside a Command?

Domain Event payloads pretending to be commands · Fact minting · private foreign Aggregate dumps · transport/HTTP/messaging metadata-as-meaning · queries disguised as commands · multi-Aggregate write sets · silent redefinition of upstream owned terms · Decision/Intent/Understanding substituted as the Command itself  

---

# 1. Definition

**ATI Command Architecture** defines Commands as single-Aggregate, language-bound business instructions that attempt Root-gated state transitions, distinct from cognitive Decision/Intent and distinct from Domain Events.

**Constitutional sentence:**

> A Command asks an Aggregate to change. A Domain Event records that it did. A Decision chooses. An Intent envelopes enactment. These are never the same thing.

---

# 2. Constitutional Principles

**CMD-P1 Instruction, Not Occurrence** — Commands request; Events record.  

**CMD-P2 Single Target** — One Command → one Aggregate Root.  

**CMD-P3 Root Gate** — Only Roots apply Commands.  

**CMD-P4 Context Ownership** — Command types owned by the Bounded Context owning the target Aggregate.  

**CMD-P5 Language Bound** — Commands use Ubiquitous Language (DDD-002).  

**CMD-P6 Acceptance Optional** — Aggregates may refuse Commands that break invariants or authority.  

**CMD-P7 Process for Multiplicity** — Multi-Aggregate change = multiple Commands under explicit process.  

**CMD-P8 Citation, Not Capture** — Commands may cite Decision/Intent/Fact identities; they do not own those meanings.  

**CMD-P9 No Cognition Collapse** — Command ≠ Decision ≠ Intent.  

**CMD-P10 Constitution Conformity** — Commands must not violate UAIA/ATI Must-Never-Overlap.

---

# 3. Command Identity

1. Each Command occurrence has a unique **command occurrence identity**.  
2. Each Command type has a name in the owning context’s Ubiquitous Language.  
3. Target Aggregate identity is mandatory.  
4. Identity is business identity — not HTTP id, not message id, not row id.  
5. Downstream technical delivery does not redefine Command identity.

---

# 4. Command Ownership

1. Owning Bounded Context defines lawful Command types for its Aggregates.  
2. Issuers (humans, Control authority, processes, other contexts via Published Language) may **issue** Commands; they do not own the Command type’s definition unless they are that context.  
3. Cross-context issuance uses DDD-003 patterns: Published Language forms / Customer-Supplier duties / Anti-Corruption at edges.  
4. No Shared Kernel of “universal commands” across all contexts.  
5. Authority to issue is governed by Mandate Authority / Control meaning (business authority) — not by transport.

---

# 5. Aggregate Relationship

| Rule | Statement |
|---|---|
| Target | Exactly one Aggregate Root per Command |
| Application | Root validates authority + invariants, then accepts or refuses |
| On accept | State transition; Domain Event(s) as applicable (DDD-005) |
| On refuse | No success transition; no success Domain Event |
| Internals | Commands never address internal Entities directly |
| Peers | Commands never modify foreign Aggregates |

---

# 6. Decision / Intent Relationship

| Rule | Statement |
|---|---|
| Decision | Cognitive selection (BC-08); not a Command |
| Intent | Enactment envelope (BC-09); not a Command |
| Abstain | May produce no Intent / Inhibit Intent — not a special “do nothing Command” required as ontology |
| Intent fulfillment | May cause one or more Commands against Enactment Aggregates (and related processes) |
| Citations | Commands may cite Decision identity and Intent identity |
| Non-enactment Commands | Evidence admission, mandate amendments, ledger corrections, etc. are Commands in their owning contexts — independent of trading Intent |
| Forbidden collapse | “The Decision is the Command” · “The Intent is the Command” · “Publish the Decision as an Event instead of commanding the Aggregate” |

---

# 7. Command Invariants

1. One Command targets one Aggregate Root.  
2. Command ≠ Domain Event ≠ Fact ≠ Decision ≠ Intent.  
3. Accepted Commands yield invariant-preserving transitions (or are refused).  
4. Command types have single Context/Aggregate owners.  
5. Multi-Aggregate outcomes require multi-Command processes.  
6. Commands do not read or write foreign Aggregate internals.  
7. Commands use Published/owned language only.  
8. Authority citations are required when mandate/permission applies.  
9. Transport/API/HTTP/messaging never define Commands.  
10. UAIA/ATI separations remain intact under Command design.

---

# 8. Forbidden Patterns

1. Command that writes multiple Aggregates in one meaning  
2. Command addressed to an internal Entity  
3. Treating Domain Events as Commands (or vice versa)  
4. Treating Facts as Commands  
5. Treating Decisions or Intents as Commands  
6. “Just update the database” as Command constitution  
7. Universal command bus language shared by all BCs as Shared Kernel  
8. Commands that mint Understanding beliefs directly  
9. Commands that mint Facts without Evidence Registry ownership  
10. Commands that activate Learning competence without Governance  
11. Downstream redefinition of upstream Command types  
12. Embedding full foreign models inside Command parameters  

---

# 9. Must Never Overlap

| Term A | Term B |
|---|---|
| Command | Domain Event |
| Command | Fact |
| Command | Decision |
| Command | Intent |
| Command | Action (Action is ATI enactment attempt; Command is DDD instruction — related by process, not identical) |
| Command | Query / read model request |
| Command | API / HTTP / message |
| Single Command | Multi-Aggregate write |
| Command ownership | Multi-context dual definition |

**Clarifying note (non-new concept):**  
Trading **Action** (ATI-007) is the cognitive/enactment attempt to affect Reality under an Intent. A **Command** is the DDD instruction that asks an Aggregate Root to record/attempt a business transition (including enactment Aggregates). Processes connect them; vocabularies must not collapse them into one word.

---

# 10. Freeze Recommendation

**Status: FROZEN**

DDD-006 freezes Command constitutional law for ATI.

**Conformance sentence:**

> This work conforms to DDD-006 Command Architecture under UAIA, ATI Constitution, and DDD-000…005; it does not redefine them.

Breaking changes require DDD-006 major version and board approval.

Catalogs of specific Commands per Aggregate may follow later; they must obey DDD-006 and DDD-002.

---

## End of DDD-006

**Commands instruct. Aggregates decide acceptance. Events record success. Decisions choose. Intents envelope. Never collapse the chain.**
