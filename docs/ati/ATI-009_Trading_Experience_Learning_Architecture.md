# ATI-009

# Trading Experience · Learning Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI-008 Trading Outcome Architecture  
**Also conforms to:** ATI-001 … ATI-007 · ATI-003 · ATI-005 · ATI-004 · ATI-006  
**UAIA primitives specialized:** Experience · Learning  
**Also binds (UAIA, not redefined):** Candidate Improvement · Governance · Memory · Knowledge · Activated Competence  
**Non-scope:** Software, DDD, APIs, model training methods, strategy design, Outcome redesign  

**Constitutional placement:**

```
Trading Outcome Stream (ATI-008)
  ↓
Trading Experience   (evaluated episode)
  ↓
Trading Learning     (proposes only)
  ↓
Candidate Improvement
  ↓
Governance
  ↓
Activated Competence (in Memory)
```

**Hard separation (frozen):**

> Experience is an evaluated episode.  
> Outcome is not Experience.  
> Experience is not Memory.  
> Experience is not Learning.  
> Learning consumes qualified Experiences.  
> Learning proposes Candidate Improvements.  
> Memory stores Experiences.  
> Knowledge is durable Memory content produced through Learning (via Governance activation).  
> Learning never trains directly on raw Outcomes.

---

# 1. Definition

## 1.1 Trading Experience

**Trading Experience** is a scoped, time-bounded, attributable, evaluated episode that binds trading context (Market Understanding and Agent Situation revisions, Decision Frame, Decision/Intent as applicable) to a closed Trading Outcome stream window, records evaluative labels of sufficient quality to serve as learning fuel, and may remain open across long horizons before closure.

## 1.2 Trading Learning

**Trading Learning** is the process that transforms qualified Trading Experiences (and other UAIA-admissible gated sources) into Candidate Improvements — or explicit no-ops/refusals — without activating live trading competence and without training directly on raw Outcomes.

**Constitutional sentence:**

> Outcomes stream. Experiences evaluate episodes. Learning proposes. Governance activates. Memory stores. Knowledge endures only after activation.

---

# 2. Scope

## In scope

- Specialization of UAIA Experience and Learning for trading  
- Long-horizon Experiences  
- Revision lineage of Experiences  
- Learning → Candidate Improvement boundary  
- Separation from Outcome, Memory identity, and production activation  

## Out of scope

- Governance procedure design beyond the activation boundary  
- ML/training implementation  
- Strategy/alpha authorship  
- Redefining Outcome Stream  
- Direct production Policy hot-patch  

---

# 3. Ontology

```
TRADING EXPERIENCE
├─ Episode identity
├─ Scope / horizon
├─ Status (lifecycle)
├─ Context refs
│   ├─ Market Understanding revision
│   ├─ Agent Situation revision
│   └─ Decision Frame revision (when applicable)
├─ Enactment refs
│   ├─ Decision / Intent (when enactment episode)
│   └─ Action path refs as needed
├─ Closed Outcome stream window refs
├─ Attribution (+ confidence)
├─ Evaluation record
│   ├─ vs Intent success
│   ├─ vs Goals
│   ├─ surprise / prediction error
│   ├─ regret / counterfactual tags (optional)
│   └─ calibration notes
├─ Evaluability / quality grade
├─ Time bounds (open / close)
└─ Revision lineage

TRADING LEARNING
├─ Learning act
│   ├─ Trigger
│   ├─ Gated inputs (qualified Experiences + other admissible sources)
│   ├─ Accept / reject / no-op
│   └─ Emissions
└─ Candidate Improvement (UAIA)
    ├─ Proposed change + target
    │   (Knowledge / Policy / Calibration / Deprecation / Meta-learning)
    ├─ Evidence support (Experience refs required on normal path)
    ├─ Scope
    ├─ Generalization confidence
    ├─ Reversibility + activation risk
    ├─ Explainability
    └─ Status → Governance → Activated Competence in Memory
```

**Memory** stores Experiences, Candidate records, and Activated Competence (including Knowledge).  
**Experience is not Memory.**  
**Knowledge** is durable compiled content in Memory produced through Learning proposals and Governance activation — not by Experience emission alone.

---

# 4. Lifecycle

## 4.1 Trading Experience

```
Candidate
  → Open
       → Growing   (Outcome stream window accruing; long horizons allowed)
            → Closed
                 → Evaluated
                      → Archived
                 → Discarded   (failed quality / unevaluable)
  → Revised   (new evidence corrects attribution/evaluation; lineage required)
```

Long-horizon Experiences may remain Open/Growing across days, months, or years until the declared horizon/window closes.

## 4.2 Trading Learning (act)

```
Triggered
  → Considered
       → Emit Candidate Improvement(s)
       | No-op
       | Reject inputs
  → Recorded
```

## 4.3 Candidate Improvement (UAIA binding)

```
Candidate
  → Validating / Under Review
       → Approved → Activated → Archived
       | Rejected → Archived
       | Rolled Back (if Activated fails in life)
```

Learning does not perform Activation.

---

# 5. Relationships

| From | To | Rule |
|---|---|---|
| Outcome Stream (closed window) | Experience | Fuel boundary; not identity |
| Outcome (element) | Experience | Not automatic promotion |
| Experience | Learning | Primary normal-path input when qualified |
| Learning | Experience | May reject / no-op; does not redefine Experience |
| Learning | Candidate Improvement | Sole normal emission of improvement proposals |
| Learning | raw Outcomes | **Forbidden** as direct training fuel |
| Experience | Memory | Stored in Memory; not identical to Memory |
| Learning | Memory | Does not freely rewrite live competence |
| Candidate Improvement | Governance | Judgment / activation |
| Governance | Activated Competence / Knowledge | Activation into Memory |
| Experience | Understanding | Never direct belief write |
| Learning | Understanding | Never direct belief write |
| Reasoning | Experience | May assist evaluation; does not own Experience |
| Decision / Intent / Action | Experience | Attribution refs for enactment episodes |

### Cardinality

- One Outcome stream → many Experiences (allowed)  
- Many streams → one Experience (allowed)  
- Experience without Learning (allowed)  
- Learning without Experience on normal path (**forbidden**)  
- Other UAIA-admissible Learning sources remain gated and secondary  

---

# 6. Invariants

1. Experience is an evaluated episode.  
2. Outcome is not Experience.  
3. Experience is not Memory.  
4. Experience is not Learning.  
5. Learning consumes qualified Experiences.  
6. Learning proposes Candidate Improvements.  
7. Memory stores Experiences.  
8. Knowledge is durable Memory content produced through Learning via Governance activation.  
9. Long-horizon Experiences are valid.  
10. Experience supports revision lineage.  
11. Learning never trains directly on raw Outcomes.  
12. Not every Outcome becomes Experience.  
13. Experience can exist without Learning.  
14. Learning never activates production competence.  
15. Governance alone activates Candidate Improvements.  
16. Experience owns evaluation labels; Learning owns improvement proposals.  
17. Weak attribution ⇒ weak or non-Experience.  
18. This document specializes UAIA Experience and Learning; it does not redefine UAIA.

---

# 7. Must Never Overlap

| A | B | Rule |
|---|---|---|
| Outcome | Experience | Consequence stream ≠ evaluated episode |
| Experience | Memory | Episode ≠ substrate |
| Experience | Learning | Fuel ≠ proposal process |
| Experience | Knowledge | Episode ≠ durable activated content |
| Learning | Governance | Proposal ≠ activation authority |
| Learning | Activated Competence | Proposal ≠ live competence |
| Outcome | Learning | Raw consequences ≠ Learning fuel |
| Experience | Understanding | Evaluated episode ≠ belief-state write |
| PnL / log / history dump | Experience | Record ≠ evaluated episode |
| Fill / Execution | Experience | Effector progress ≠ Experience |

---

# 8. Vocabulary Annex

| Forbidden phrase | Legal constitutional phrasing |
|---|---|
| “The trade outcome is the experience” | Outcome stream window closed; Experience formed only if evaluated and quality-gated |
| “We learned from the fills” | Fills are Execution/Self evidence; Learning requires qualified Experiences, not raw Outcomes |
| “Experience is in Memory so it is Memory” | Memory stores Experiences; Experience remains the evaluated episode |
| “Learning updated production” | Learning emitted a Candidate Improvement; Governance activates competence |
| “Every closed PnL is an Experience” | PnL path may evidence Outcomes; Experience requires attribution, horizon, and evaluation |
| “Knowledge from one anecdote” | Knowledge requires Learning proposal + Governance activation with scoped generalization |
| “Open experience forever without horizon” | Long horizon allowed; unbounded anonymous openness without scope is illicit |
| “Training on outcomes” | Forbidden — Learning never trains directly on raw Outcomes |

---

# 9. Freeze Statement

**Document:** ATI-009 Trading Experience · Learning Architecture  
**Status:** **FROZEN**  
**Version:** 1.0  

This document specializes UAIA Experience and Learning for trading under ATI-008. It introduces no new UAIA primitives and does not redefine Outcome, Memory, Governance, Decision, or Understanding.

**Conformance sentence:**

> This architecture specializes UAIA v1.0 and ATI-008; it does not redefine them.

Breaking semantic changes require a new ATI-009 major version and board re-approval.

---

## End of ATI-009

**Outcomes stream. Experiences evaluate. Learning proposes. Governance activates. Memory stores. Knowledge endures only when activated.**
