# ATI Constitution

# Autonomous Trading Intelligence — Constitutional Index

**Document:** ATI-CONSTITUTION  
**Version:** 1.0  
**Status:** FROZEN  

This document introduces no new concepts and redesigns no architecture.  
It consolidates the already established ATI constitutional documents under UAIA v1.0.

---

# 1. Purpose

This Constitution is the authoritative index of Autonomous Trading Intelligence (ATI).

It states:

- the parent authority of UAIA v1.0;
- the scope of ATI as a specialization of UAIA;
- the ordered set of frozen ATI constitutional documents;
- the cognitive flow and mandatory separations;
- conformance rules for all future ATI and software work.

ATI is a specialization of UAIA for trading.  
ATI is not a redefinition of UAIA.

---

# 2. Parent Architecture (UAIA v1.0)

**Parent:** UAIA v1.0 — Universal Autonomous Intelligence Architecture  
**Status:** FROZEN  

**Authority rule:**

> UAIA always has higher authority than ATI.  
> If ATI conflicts with UAIA, UAIA wins.  
> ATI specializes UAIA. ATI may never redefine UAIA.

All ATI documents must remain conformant to UAIA primitives, invariants, laws, and Must-Never-Overlap rules.

---

# 3. ATI Constitution Scope

## In scope

- Trading Environment  
- Trading Observation  
- Market Understanding (Environment Understanding stratum)  
- Agent Situation (Understanding stratum)  
- Trading Decision Frame / Decision / Intent path as specialized  
- Trading Reasoning (+ Reasoning Workspace as internal construct)  
- Trading Action / Execution  
- Trading Outcome Stream  
- Trading Experience / Learning  

## Out of scope

- Redefinition of UAIA  
- Software service topology  
- Broker protocols  
- Strategy / alpha design  
- Implementation technologies  

Software architecture and domain architecture built for ATI must conform to this Constitution and its indexed documents.

---

# 4. ATI Document Index

| ID | Title | Role |
|---|---|---|
| **ATI-001** | Trading Environment Architecture | External trading Reality ATI inhabits |
| **ATI-002** | Trading Observation Architecture | What ATI may observe; percepts only |
| **ATI-003** | Market Understanding Ontology | Environment Understanding beliefs (M1–M20) |
| **ATI-004** | Trading Decision Architecture | Decision Frame · Decision · Intent boundary · Opportunity in Reasoning |
| **ATI-005** | Trading Agent Situation Architecture | Self Understanding stratum (S1–S11) |
| **ATI-006** | Trading Reasoning Architecture | Deliberation without choice |
| **ATI-006R** | Reasoning Workspace | Internal Reasoning construct (not a UAIA primitive) |
| **ATI-007** | Trading Intent · Action · Execution | Enactment envelope · attempt · effector progress |
| **ATI-008** | Trading Outcome Architecture | Evidence-bound consequence stream |
| **ATI-009** | Trading Experience · Learning Architecture | Evaluated episodes · Learning proposes Candidates |

Each document remains the authority for its specialized subject.  
This Constitution does not replace their freeze texts.

---

# 5. Dependency Order

Documents must be read and extended in this order:

```
UAIA v1.0
  ↓
ATI-001 Trading Environment
  ↓
ATI-002 Trading Observation
  ↓
ATI-003 Market Understanding
  ↓
ATI-005 Agent Situation
  ↓
ATI-004 Trading Decision
  ↓
ATI-006 Trading Reasoning
  ↓
ATI-006R Reasoning Workspace
  ↓
ATI-007 Trading Intent / Action / Execution
  ↓
ATI-008 Trading Outcome
  ↓
ATI-009 Trading Experience / Learning
```

**Notes:**

- ATI-005 completes Understanding with ATI-003 before Decision (ATI-004) is fully grounded.  
- ATI-006R is an addendum owned by ATI-006, not an independent cognitive layer.  
- Later documents may cite earlier ones; earlier documents must not depend on later ones for definitional meaning.

---

# 6. Cognitive Flow

```
Trading Environment (ATI-001)
  ↓
Observation → Percepts (ATI-002)
  ↓
Facts → Assimilation   [UAIA Truth Layer]
  ↓
Understanding
  ├─ Market Understanding (ATI-003)
  └─ Agent Situation (ATI-005)
  ↓
Decision Frame (ATI-004)
  ↓
Reasoning (+ Workspace) (ATI-006 / ATI-006R)
  ↓
Decision (ATI-004)
  ↓
Intent → Action → Execution (ATI-007)
  ↓
Execution ∥ Outcome Stream (ATI-008)
  ↓
Experience (ATI-009)
  ↓
Learning → Candidate Improvement → Governance → Activated Competence (ATI-009 / UAIA)
```

Cross-cutting (UAIA): Goals · Memory · Control (including Attention).

---

# 7. Must Never Overlap Matrix

| Must remain distinct | Must remain distinct |
|---|---|
| Observation | Facts |
| Facts | Truth / Understanding |
| Market Understanding | Agent Situation |
| Understanding | Knowledge / Memory |
| Understanding | Opportunity / Decision |
| Reasoning | Decision |
| Reasoning Workspace | Understanding / Memory / Decision |
| Decision | Intent |
| Intent | Action |
| Action | Execution |
| Intent / Action | Order (as constitutional identity) |
| Execution | Outcome |
| Fill / ack | Outcome |
| Outcome | Experience |
| Experience | Memory |
| Experience | Learning |
| Learning | Governance / Activated Competence |
| Outcome | Learning (direct fuel) |

Full separation detail remains in UAIA and the indexed ATI documents.

---

# 8. Parent-Child Relationships

| Child | Parent(s) |
|---|---|
| ATI-001 | UAIA (Reality specialization for trading) |
| ATI-002 | UAIA Observation · ATI-001 |
| ATI-003 | UAIA Understanding (Environment stratum) · ATI-001 · ATI-002 |
| ATI-005 | UAIA Understanding (Agent Situation stratum) · ATI-001 · ATI-002 |
| ATI-004 | UAIA Decision Frame · Decision · Intent boundary · ATI-003 · ATI-005 |
| ATI-006 | UAIA Reasoning · ATI-003 · ATI-005 · ATI-004 |
| ATI-006R | ATI-006 (internal construct only) |
| ATI-007 | UAIA Intent · Action · Execution · ATI-004 |
| ATI-008 | UAIA Outcome · ATI-007 |
| ATI-009 | UAIA Experience · Learning · ATI-008 |

Every future ATI document must cite its parent documents explicitly.

---

# 9. Conformance Rules

1. **UAIA supremacy** — UAIA always outranks ATI.  
2. **Specialization only** — ATI specializes UAIA; ATI never redefines UAIA primitives.  
3. **Document authority** — Subject matter is governed by the indexed ATI document for that subject.  
4. **Citation rule** — Every future ATI document must cite its parent documents.  
5. **Software conformance** — Software architecture must conform to ATI (and thus to UAIA).  
6. **Domain conformance** — Domain architecture must conform to ATI (and thus to UAIA).  
7. **No silent semantics** — Breaking semantic changes require a new major version of the affected ATI document and board re-approval.  
8. **No overlap violations** — Implementations and later docs must preserve the Must Never Overlap matrix.  
9. **Annex discipline** — Vocabulary annexes in ATI documents are normative for terminology; they do not add primitives.  
10. **Workspace rule** — Reasoning Workspace remains internal to Reasoning (ATI-006R); never a UAIA primitive.

---

# 10. Freeze Status

| Artifact | Freeze status |
|---|---|
| UAIA v1.0 | FROZEN |
| ATI-001 | FROZEN |
| ATI-002 | FROZEN |
| ATI-003 | FROZEN |
| ATI-004 | FROZEN |
| ATI-005 | FROZEN |
| ATI-006 | FROZEN |
| ATI-006R | FROZEN |
| ATI-007 | FROZEN |
| ATI-008 | FROZEN |
| ATI-009 | FROZEN |
| **ATI-CONSTITUTION** | **FROZEN** |

Phase B constitutional spine (ATI-001 through ATI-009 + this index) is frozen under UAIA v1.0.

---

# 11. Version

**ATI Constitution Version:** 1.0  
**Status:** FROZEN  

Breaking changes to this index or to the meaning of indexed documents require a new major Constitution version and explicit board approval.

**Conformance sentence for all ATI work:**

> This work specializes UAIA v1.0 and conforms to ATI Constitution v1.0; it does not redefine UAIA.

---

## End of ATI Constitution

**UAIA governs cognition. ATI specializes trading. Documents freeze meaning. Software obeys.**
