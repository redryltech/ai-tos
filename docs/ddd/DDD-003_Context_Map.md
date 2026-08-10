# DDD-003

# Context Map

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000 · DDD-001 · DDD-002 (all FROZEN)  
**Non-scope:** Software, APIs, databases, event buses, messaging products, implementation, redesign of parents  

**Mission:** Define constitutional laws of relationship and communication among ATI Bounded Contexts — business architecture only.

---

# 0. Foundational Answers (Constitutional)

### 1. What is a Context Map at the constitutional level?

A **Context Map** is the authoritative declaration of how Bounded Contexts relate in **meaning**: which context is upstream/downstream for which concepts, which languages are published, where translation is mandatory, and which relationship patterns are legal — so that enterprise models do not silently merge.

It is a **map of semantic relationships**, not a network diagram of runtimes.

### 2. What is NOT a Context Map?

Not a microservice topology · not an API catalog · not a database ERD · not an event-bus topic list · not an org chart · not a cognitive flow redraw of UAIA/ATI · not a license to share one enterprise god-model.

### 3. What kinds of relationships may legally exist?

Legal relationship kinds are **semantic dependency relationships** between Bounded Contexts:

- Upstream / Downstream meaning dependence  
- Published Language provision / consumption  
- Conformist adoption of upstream language  
- Customer/Supplier obligation of meaning delivery  
- Anti-Corruption translation at the boundary  
- Partnership (rare, explicit, equal semantic negotiation)  
- Shared Kernel (exceptional, tiny, frozen)

### 4. Which DDD patterns survive constitutionally?

| Pattern | Survives? | Constitutional reading |
|---|---|---|
| Partnership | **Yes — rare** | Equal negotiation of a thin shared meaning; never a god-model |
| Customer/Supplier | **Yes** | Downstream depends on upstream published meaning; upstream owes semantic stability |
| Conformist | **Yes** | Downstream adopts upstream Published Language as-is |
| Published Language | **Yes — primary** | Owner publishes stable consumable language |
| Anti-Corruption Layer | **Yes — primary at risk edges** | Protect local language from foreign/private models |
| Open Host Service | **Survive only as business meaning** = continuous provision of Published Language by an upstream host — **not** as an API/tech pattern in this constitution |
| Shared Kernel | **Yes — exceptional only** | Tiny frozen shared subset; default = none |

### 5. Which patterns should ATI encourage?

**Published Language · Conformist (on reference/evidence/citation forms) · Customer/Supplier (clear upstreams) · Anti-Corruption (at Deliberation, Enactment↔Ledger, Mandate↔Competence edges).**

### 6. Which patterns should ATI forbid?

Unnamed shared models · mutual free-for-all “partnership” across Must-Never-Overlap pairs · reading another context’s private model · Shared Kernel as default · Open Host as technology mandate · Conformist adoption of private workspace jargon.

### 7. Can two contexts communicate directly without translation?

**Only when consuming Published Language exactly as published (Conformist).**  
Any use of non-published / private / colliding terms requires translation (Anti-Corruption).

### 8. When is translation mandatory?

- Crossing BC boundaries with non-published terms  
- Homonyms / qualified collisions (DDD-002)  
- Protecting a context from foreign meaning (especially BC-07, BC-05↔BC-09, BC-06↔BC-12)  
- Inbound informal or external speech  

### 9. Should one context ever read another context’s internal model?

**Never.**  
Only Published Language and explicitly supplied downstream contracts of meaning. Private models are opaque.

### 10. What architectural laws govern context communication?

See §§2–11. Supreme laws: UAIA/ATI Must-Never-Overlap; DDD-001 single ownership; DDD-002 single meaning; no private-model reach-in; translation honesty.

---

# 1. Definition

**ATI Context Map** is the frozen constitutional map of semantic relationships among BC-01…BC-12: upstream/downstream dependencies, allowed relationship patterns, Published Language flows, mandatory translation points, and forbidden couplings — subordinate to UAIA, ATI, DDD-000, DDD-001, and DDD-002.

---

# 2. Constitutional Principles

**CM-P1 Semantic Map** — The Context Map governs meaning relationships, not runtimes.  

**CM-P2 Ownership First** — Relationships never transfer definitional ownership (DDD-001/002).  

**CM-P3 Published by Default for Cross-Talk** — Prefer Published Language over ad-hoc exchange.  

**CM-P4 Translation Honesty** — Private or colliding language requires Anti-Corruption.  

**CM-P5 Opacity of Internals** — No context reads another’s internal model.  

**CM-P6 Overlap Guard** — No relationship may blend Must-Never-Overlap pairs into one language.  

**CM-P7 Upstream Stability Duty** — Upstream publishers owe semantic stability to downstream consumers.  

**CM-P8 Downstream Non-Redefinition** — Downstream may Conformist-consume or translate; never redefine upstream terms.  

**CM-P9 Shared Kernel Exceptionalism** — Default Shared Kernel = none.  

**CM-P10 Constitution Supremacy** — UAIA/ATI outrank any convenience coupling on the map.

---

# 3. Relationship Types

## 3.1 Legal relationship types

| Type | Meaning |
|---|---|
| **Upstream → Downstream** | Downstream depends on upstream Published Language |
| **Published Language Host** | Upstream continuously offers consumable official language (business reading of Open Host) |
| **Conformist** | Downstream adopts Published Language unchanged |
| **Customer/Supplier** | Downstream (customer) requires specific published meanings; upstream (supplier) commits to provide them |
| **Anti-Corruption** | Downstream translates foreign meaning into local language |
| **Partnership** | Rare bilateral negotiation of a thin interface language |
| **Shared Kernel** | Exceptional tiny shared definition set, explicitly frozen |

## 3.2 ATI Context Map (conceptual semantic flows)

```
BC-01 Environment Reference
  │ Published Language (reference IDs)
  ▼
BC-02 Market Sensing ──percepts──► BC-03 Evidence Registry
  │                                  │ Facts (Published citation forms)
  │                                  ├──────────► BC-04 Market Intelligence
  │                                  └──────────► BC-05 Agent Ledger
  │                                                  │
  └──────── Self/Channel percepts ───────────────────┘

BC-06 Mandate Authority ──constraint/mandate law──► BC-08 Decision Authority
BC-04 ──Understanding revisions──► BC-07 Deliberation ──alternatives/opportunities──► BC-08
BC-05 ──Situation revisions / utilization readings──► BC-07 & BC-08

BC-08 ──Decisions──► BC-09 Trade Enactment
BC-09 ──Execution ∥ enactment coupling──► BC-10 Consequence
BC-10 ──closed Outcome windows──► BC-11 Experience
BC-11 ──qualified Experiences──► BC-12 Competence Evolution

BC-01 Publishes reference language to all consumers (Conformist/Customer).
BC-03 Publishes Fact citation language to BC-04/05/10/11.
```

### Pattern assignments (default)

| Edge | Pattern |
|---|---|
| BC-01 → all | Published Language Host + Conformist consumers |
| BC-02 → BC-03 | Customer/Supplier (Evidence admits Sensing percepts) |
| BC-03 → BC-04 / BC-05 | Published Language (Fact citations) + Conformist citation |
| BC-04 / BC-05 → BC-07 | Published Language (revision citations) + **Anti-Corruption** (workspace must not absorb beliefs as owned Understanding) |
| BC-06 → BC-08 | Published Language / Customer/Supplier (mandate law for Frame) |
| BC-05 → BC-08 | Published Language (utilization/headroom readings) |
| BC-07 → BC-08 | Customer/Supplier + Anti-Corruption (ranking ≠ Decision) |
| BC-08 → BC-09 | Published Language / Customer/Supplier (Decision → Intent) |
| BC-09 → BC-10 | Customer/Supplier + Anti-Corruption (Execution ≠ Outcome) |
| BC-09 ↔ BC-05 | Anti-Corruption both ways as needed (Inventory vs Enactment language) |
| BC-10 → BC-11 | Published Language / Customer/Supplier (closed windows) |
| BC-11 → BC-12 | Customer/Supplier (qualified Experiences) |
| BC-06 ↔ BC-12 | Anti-Corruption + qualified terms (Mandate law vs Activated Policy kinds) |
| BC-10 → BC-03 | Citation only (Outcomes cite Facts; no Fact redefinition) |

---

# 4. Communication Rules

1. Contexts communicate **meanings**, not “integrations.”  
2. Only **Published Language** or **explicitly translated** content may cross boundaries.  
3. Upstream owes **semantic stability**; breaking published meaning is a constitutional change.  
4. Downstream must **cite owners** (DDD-002), not fork definitions.  
5. Cognitive flow of UAIA/ATI remains the behavioral law; Context Map does not replace it.  
6. No context may require another to expose private model internals.  
7. Partnership requires written thin interface language and board-visible scope.  
8. Convenience is not a legal basis for a new edge that violates ownership.

---

# 5. Translation Rules

1. Translation is mandatory for private language, homonyms, and overlap-risk edges.  
2. Translation maps to local Ubiquitous Language without creating a third authoritative definition.  
3. DDD-002 collision qualifications (Position/Risk/Policy/Order/Signal) are mandatory in translation.  
4. Anti-Corruption is the default pattern when protecting BC-04, BC-05, BC-07, BC-08, BC-10 from foreign mush.  
5. Failed translation (ambiguous meaning) must not proceed as if Conformist.

---

# 6. Published Language Rules

1. Every cross-context dependency should prefer an upstream **Published Language**.  
2. Published Language is owned solely by the publishing context (DDD-001/002).  
3. Consumers may Conformist-adopt or wrap with Anti-Corruption; they may not extend definitions.  
4. BC-01, BC-03, BC-04, BC-05, BC-06, BC-08, BC-09, BC-10, BC-11 must maintain Published Language for their outbound citation forms.  
5. BC-07 workspace jargon is **not** Published Language until explicitly promoted.  
6. Revoking or breaking Published Language requires versioned constitutional change.

---

# 7. Anti-Corruption Rules

1. Anti-Corruption protects local Ubiquitous Language from foreign models and informal speech.  
2. **Mandatory Anti-Corruption postures** (at minimum):  
   - BC-07 consuming BC-04/BC-05 (beliefs ≠ workspace artifacts)  
   - BC-08 consuming BC-07 (alternatives/opportunities ≠ Decisions)  
   - BC-10 consuming BC-09 (Execution ≠ Outcome)  
   - BC-05 ↔ BC-09 (Inventory ≠ Enactment progress)  
   - BC-06 ↔ BC-12 (Mandate law ≠ Activated Policy kinds)  
3. Anti-Corruption may not become a hidden second owner of upstream concepts.  
4. Anti-Corruption may not mint Facts, Decisions, or Understanding beliefs.

---

# 8. Shared Kernel Rules

1. **Default Shared Kernel = none.**  
2. Shared Kernel, if ever proposed, must be: tiny, explicitly listed terms, frozen, dual-approved by both owners’ stewards, and incapable of hosting Decision/Intent/Outcome/Experience/Learning blends.  
3. BC-01 reference identifiers are **Published Language**, not Shared Kernel.  
4. “Everyone uses the same Position object” is **forbidden** as Shared Kernel rationale.  
5. Creating a Shared Kernel is a constitutional event — not a team convenience.

---

# 9. Forbidden Relationships

1. Unnamed shared enterprise model across BCs  
2. Read-access to another context’s internal model  
3. Partnership that merges Must-Never-Overlap pairs  
4. Conformist adoption of private Reasoning Workspace jargon  
5. Downstream redefinition of upstream terms  
6. Dual semantic ownership edges (“both own Position”)  
7. Shared Kernel by default  
8. Mapping Context Map edges to microservices/APIs/buses as if that were the constitution  
9. Bypassing BC-03 to let Deliberation/Decision mint Facts  
10. Bypassing BC-08 so Deliberation commits Decisions  
11. Bypassing BC-11 so Learning trains on raw Outcomes from BC-10  
12. Treating UAIA cognitive arrows as permission to ignore BC ownership  

---

# 10. Context Interaction Invariants

1. Every inter-context meaning flow has an explicit legal pattern.  
2. Ownership never moves with a relationship arrow.  
3. Published Language is the default cross-talk medium.  
4. Private models remain opaque.  
5. Translation is mandatory when Published Language is insufficient.  
6. Must-Never-Overlap pairs never share a blended interface language.  
7. Upstream semantic breaks require versioned change.  
8. Context Map does not redesign UAIA/ATI cognitive law.  
9. Customer/Supplier duties are duties of **meaning**, not of runtime SLAs (those are out of scope here).  
10. Open Host survives only as Published Language hosting duty — not as technology.

---

# 11. Must Never Overlap

Context Map relationships must never collapse:

| Pair |
|---|
| Sensing Percept ↔ Evidence Fact |
| Fact ↔ Understanding belief |
| Market Intelligence ↔ Agent Ledger |
| Deliberation artifact ↔ Decision |
| Decision ↔ Intent |
| Intent/Action ↔ Order identity |
| Execution ↔ Outcome |
| Outcome ↔ Experience |
| Experience ↔ Learning |
| Learning ↔ Governance activation |
| Mandate law ↔ Constraint utilization |
| Mandate law ↔ Activated Policy kind (unqualified) |
| Inventory belief ↔ Execution progress language |

---

# 12. Freeze Recommendation

**Status: FROZEN**

DDD-003 is the constitutional Context Map law for ATI Bounded Contexts.

**Conformance sentence:**

> This work conforms to DDD-003 Context Map under UAIA, ATI Constitution, DDD-000, DDD-001, and DDD-002; it does not redefine them.

Breaking changes require DDD-003 major version and board approval.

---

## End of DDD-003

**Publish meaning. Translate at the edge. Never read private models. Never share a god kernel. Never collapse the constitution.**
