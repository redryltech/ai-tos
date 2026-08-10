# Board Discussion — Phase C Prelude

# Bounded Context Constitutional Foundation

**Status:** FOUNDATION FOR DDD-001 (not DDD-001 itself)  
**Parents:** UAIA v1.0 (FROZEN) · ATI Constitution v1.0 (FROZEN) · ATI-001…009 (FROZEN)  
**Non-scope:** Software services, microservices, APIs, databases, UI modules, implementation, redesign of UAIA/ATI  

**Mission:** Freeze the *meaning* of Bounded Context for ATI before DDD-001 is written.

---

# 1. Board Discussion

## The trap

Teams often call a Bounded Context whatever is convenient this quarter:

- a microservice  
- a database schema  
- a UI screen  
- a team name  
- a cognitive verb (“Reasoning Service”)  
- a copy of every ATI document  

That produces temporary partitions, not 20-year boundaries.

## What must be true

ATI already froze **cognitive constitution** (UAIA/ATI).  
Phase C must freeze **enterprise ownership boundaries** that *protect* that constitution in the business of trading intelligence — without re-describing cognition as “contexts.”

Bounded Contexts are not UAIA primitives.  
Bounded Contexts are not ATI documents.  
Bounded Contexts are **semantic ownership boundaries** for models of the trading-intelligence enterprise that *conform to* UAIA/ATI.

## Aggressive stance

- Cognitive primitives must **not** each become a Bounded Context by default.  
- Organizational charts must **not** define Bounded Contexts.  
- Technology deployables must **not** define Bounded Contexts.  
- One business concept must have **one semantic owner**; others may *reference* it, never *redefine* it.

---

# 2. Direct Verdicts

### Q1 — What is a Bounded Context at the constitutional level?

**Verdict:**  
A **Bounded Context** is a permanent semantic ownership boundary: a named sphere in which a specific set of business/domain concepts has **one authoritative model**, **one ubiquitous language**, and **one owner of meaning** — such that terms outside that sphere must not silently mean something else.

It is a **meaning boundary**, not a runtime boundary.

### Q2 — What is NOT a Bounded Context?

**Verdict — permanently not Bounded Contexts:**

| Not a BC | Why |
|---|---|
| A microservice / deployable | Technology |
| A database / schema | Storage |
| A UI module / screen | Presentation |
| A team / org chart box | Organization (may *align* later; must not *define*) |
| A UAIA primitive (Observation, Reasoning, …) | Cognitive constitution — already owned by UAIA/ATI docs |
| An ATI document (ATI-003, …) | Constitutional specialization docs — parents of models, not BCs themselves |
| A shared “god model” of everything | Anti-boundary |
| A temporary project workstream | Not permanent |

### Q3 — What should Bounded Contexts represent?

**Verdict:**

| Candidate | Ruling |
|---|---|
| Business capabilities | **Primary basis** — enduring capabilities of the trading-intelligence enterprise |
| Organizational teams | **Not definitional** — Congruence Principle may align teams *to* BCs later |
| Software services | **Not definitional** |
| Databases | **Forbidden as definition** |
| UI modules | **Forbidden as definition** |
| Cognitive primitives | **Forbidden as 1:1 BC map** — cognition is cross-cutting constitution |
| Something else | **Semantic ownership of trading-intelligence business models** that *conform to* ATI/UAIA |

**Frozen formula:**

> Bounded Contexts partition **business semantic ownership**.  
> UAIA/ATI partition **cognitive constitution**.  
> These layers must not be collapsed.

### Q4 — What makes a boundary permanent (10–20 years)?

**Verdict — permanence tests (all should hold):**

1. **Semantic stability** — the language of the context remains meaningful if tech stacks change.  
2. **Ownership clarity** — one clear steward of meaning (not “everyone edits”).  
3. **Change cohesion** — concepts that change together for the same business reason live together.  
4. **Independence of truth** — the context can state its truths without borrowing another context’s private model.  
5. **ATI conformance** — boundaries protect ATI Must-Never-Overlap rules rather than blur them.  
6. **Venue/tech independence** — survives broker/venue/cloud changes (ATI-001 already taught this).  
7. **Failure isolation of meaning** — corruption of one model does not redefine another’s terms.

If a proposed BC fails these tests, it is a module, team, or service — not a Bounded Context.

### Q5 — How should UAIA and ATI influence Bounded Contexts?

**Verdict:**

| Layer | Role |
|---|---|
| UAIA | Supreme cognitive law — BCs may not redefine primitives |
| ATI Constitution + ATI-001…009 | Trading specialization law — BCs must conform; BCs implement *enterprise ownership* of models consistent with ATI meanings |
| Bounded Contexts | Own **business models and languages** that *map onto* ATI concepts without becoming those concepts |

**Influence rules:**

- Every BC must declare which ATI/UAIA concepts it **guards**, **references**, or **must not own**.  
- No BC may own both sides of a Must-Never-Overlap pair as one blended model (e.g. Decision+Order, Execution+Outcome, Experience+Learning activation).  
- Cognitive flow remains UAIA/ATI; BCs do not invent a rival cognitive stack.

### Q6 — Should every ATI concept have exactly one business owner?

**Verdict:**  
**Every ATI *business-facing semantic concept* that appears in enterprise models must have exactly one Bounded Context that owns its meaning.**

Caveats:

- Some ATI concepts are **constitutional cross-cutting** (Control, Goals, Attention) — owned as *policy of meaning* by governance of the constitution, referenced by many BCs, **redefined by none**.  
- “One owner” means **one semantic owner**, not one deployable.

### Q7 — Can two Bounded Contexts own the same business concept?

**Verdict:** **No.**

They may:

- **reference** another context’s published language;  
- hold **local identifiers / projections**;  
- use **different terms** for different meanings (honest divergence);

They may **not**:

- both claim authoritative definition of the same concept;  
- quietly fork “Order,” “Position,” “Risk,” “Opportunity” with conflicting meanings and pretend unity.

### Q8 — How should Bounded Contexts communicate?

**Verdict (constitutional, not technical):**

Communication is **explicit translation between models**, never implicit shared mush.

Allowed patterns of meaning exchange:

1. **Published Language** — a context publishes a stable subset others may consume.  
2. **Conformist** — a downstream context adopts upstream language deliberately.  
3. **Anti-Corruption** — a context translates foreign models at the boundary to protect its own language.  
4. **Shared Kernel** (rare, frozen, tiny) — only for truly shared immutable reference concepts; never for Decision/Intent/Outcome/Experience blends.

Forbidden:

- unnamed shared model across all contexts;  
- reaching into another context’s private continuum of meaning;  
- “just use the same table/object” as architecture (implementation leak — forbidden even as metaphor for BC definition).

### Q9 — What architectural mistakes must be permanently forbidden?

**Forbidden forever:**

1. BC = microservice  
2. BC = database  
3. BC = UI app  
4. BC = squad name  
5. One BC per UAIA primitive by default  
6. One BC that owns the entire ATI cognitive loop  
7. Dual semantic ownership of the same concept  
8. Blending Must-Never-Overlap pairs inside one model  
9. Treating Reasoning Workspace as a BC  
10. Treating Opportunity as Market Understanding inside a BC  
11. Treating Execution as Outcome inside a BC  
12. Treating Experience as Learning activation inside a BC  
13. Silent term reuse across contexts without translation  
14. Redefining UAIA/ATI inside a BC charter  
15. Letting org redesign rewrite BC boundaries weekly  
16. Shared Kernel that becomes a god model  
17. “Enterprise data model” as substitute for BCs  
18. Using Bounded Context to mean “folder in the monorepo”  

### Q10 — What principles should be frozen before DDD-001 is written?

See §3 below — these are proposed **Phase C freeze locks**.

---

# 3. Architecture Principles (Freeze Candidates)

**BC-P1 Meaning Boundary**  
A Bounded Context is a semantic ownership boundary, not a runtime or storage boundary.

**BC-P2 Capability Basis**  
Bounded Contexts are drawn primarily around enduring business capabilities of Autonomous Trading Intelligence — not around teams or tech.

**BC-P3 Constitution Supremacy**  
UAIA > ATI Constitution > ATI-001…009 > Bounded Context charters. Lower layers conform; they do not redefine higher layers.

**BC-P4 Dual-Layer Non-Collapse**  
Cognitive constitution (UAIA/ATI) and enterprise semantic ownership (BCs) are distinct layers. Do not 1:1 map primitives to contexts.

**BC-P5 Single Semantic Owner**  
Each business concept has exactly one authoritative owning context. Others reference or translate.

**BC-P6 Overlap Guard**  
No Bounded Context may own both sides of an ATI/UAIA Must-Never-Overlap pair as one blended ubiquitous language.

**BC-P7 Translation Honesty**  
Cross-context communication is explicit translation / published language / anti-corruption — never silent shared meaning.

**BC-P8 Permanence Test**  
A proposed BC must pass semantic stability, ownership clarity, change cohesion, independence of truth, ATI conformance, venue/tech independence, and failure isolation of meaning.

**BC-P9 Cross-Cutting References**  
Goals, Control, and similar cross-cutting constitutional concerns are referenced widely, redefined nowhere, and not inflated into catch-all BCs.

**BC-P10 DDD-001 Constraint**  
DDD-001 may only *apply* these principles to name and relate ATI Bounded Contexts. It may not invent new cognitive primitives or weaken ATI separations.

---

# 4. Freeze Recommendations

## Freeze now (before DDD-001)

| Item | Recommendation |
|---|---|
| BC definition as semantic ownership boundary | **FREEZE** |
| Rejection of BC=service/DB/UI/team/primitive | **FREEZE** |
| Capability-primary basis | **FREEZE** |
| UAIA/ATI supremacy over BC charters | **FREEZE** |
| Single semantic owner rule | **FREEZE** |
| Ban on dual ownership | **FREEZE** |
| Ban on blending Must-Never-Overlap pairs | **FREEZE** |
| Communication as translation/published language/ACL | **FREEZE** |
| Permanence tests | **FREEZE** |
| Principles BC-P1…P10 | **FREEZE as DDD-000 foundation** |

## Explicitly do **not** freeze yet (belongs in DDD-001)

- The actual list/names of ATI Bounded Contexts  
- Context maps / relationship graph between named BCs  
- Which capability owns which ATI concept catalog  

## DDD-001 entry criteria

DDD-001 may be written only when it:

1. cites this foundation + UAIA + ATI Constitution;  
2. proposes BCs from **business capabilities**, validated by permanence tests;  
3. maps each BC to ATI concepts as **guards / references / forbidden owns**;  
4. introduces **no new cognitive concepts**;  
5. preserves every ATI Must-Never-Overlap rule.

---

# 5. Board Closing Verdict

**Bounded Context ≠ cognition chunk ≠ microservice ≠ team.**

For ATI, a Bounded Context is a **20-year semantic ownership boundary around an enduring trading-intelligence business capability**, subordinate to UAIA/ATI, with one owner of meaning, explicit translation at edges, and absolute prohibition on blending frozen separations.

**DDD-001 may proceed only on this foundation.**  
**DDD-001 is not authorized to redesign UAIA or ATI.**

---

## End of Phase C Prelude
