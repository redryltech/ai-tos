# ATI-008

# Trading Outcome Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI-007 Trading Intent · Action · Execution  
**Also conforms to:** ATI-001 · ATI-002 · ATI-003 · ATI-005 · ATI-004  
**UAIA primitive specialized:** Outcome (Outcome Stream)  
**Non-scope:** Experience (ATI-009), Learning, Execution identity, Decision/Intent redesign, software, DDD, APIs  

**Constitutional placement:**

```
Trading Action
  ↓
Trading Execution  ∥  Trading Outcome Stream
  ↓
Experience (ATI-009) consumes closed Outcome stream windows
```

**Hard separation (frozen):**

> Outcome is an evidence-bound consequence stream.  
> Outcome runs concurrently with Execution.  
> Outcome may continue after Execution ends.  
> Execution is never Outcome.  
> Fill is not an Outcome.  
> Outcome never updates Understanding directly.

---

# 1. Definition

**Trading Outcome** is a scoped, evidence-bound record of consequential change in Agent Situation and/or the Trading Environment associated with a trading enactment path (Intent/Action), including partial, failed-intent, neutral, and unintended changes.

Known Outcomes exist for ATI only as **evidence-bound records** of observed/accepted change — not as claims of omniscient Reality.

**Trading Outcome Stream** is the continuous sequence of such Outcomes over an enactment path: it may begin while Execution is active, run concurrently with Execution, and continue after Execution ends.

**Constitutional sentence:**

> Execution reports effector progress. Outcome records what changed in the trading body and/or environment. Experience later evaluates closed Outcome stream windows.

---

# 2. Scope

## In scope

- Specialization of UAIA Outcome / Outcome Stream for trading  
- Concurrency with Trading Execution  
- Multi-Outcome from one Action  
- Failed/partial Action consequences  
- Attribution to Intent/Action (including uncertain/unintended)  
- Closed stream windows as fuel boundary for Experience  

## Out of scope

- Experience evaluation ownership (ATI-009)  
- Learning / Candidate Improvement  
- Treating fills/acks as Outcomes  
- Direct Understanding writes  
- Strategy, signals, opportunity judgments  

---

# 3. Ontology

```
TRADING OUTCOME
├─ Scoped situational change
│   ├─ Agent Situation deltas
│   │   (inventory, cash, capacity, commitments, performance path, …)
│   └─ Environment deltas (if any)
│       (impact traces, venue-status consequences attributable to path, …)
├─ Time / as-of
├─ Fact provenance
├─ Attribution
│   ├─ Intent / Action links
│   ├─ Intended vs unintended
│   └─ Attribution confidence
├─ Completeness
├─ Record confidence
└─ Evaluative tags vs Intent success / Goals (optional; not Experience)

TRADING OUTCOME STREAM
├─ Enactment path ref (Intent / Action)
├─ Stream elements (Outcomes over time)
├─ Concurrent with Execution (while active)
├─ Residual phase (may continue after Execution ends)
└─ Stream window (open → closed for Experience candidacy)
```

No peer “Fill Outcome” object. Fills are Execution (and Self Observation) inputs that may *evidence* later Outcomes after Facts → Assimilation reveal situational change.

---

# 4. Outcome Stream

## 4.1 Concurrency

```
Action begins
  ↓
┌─────────────────────────────────────────┐
│  Trading Execution  (effector progress) │
│            ∥ concurrent                  │
│  Trading Outcome Stream                 │
│  (situational changes as caused/revealed)│
└─────────────────────────────────────────┘
  ↓
Execution may complete / fail / cancel
  ↓
Outcome Stream may still continue (residual effects)
  ↓
Stream window closed + attributed
  ↓
Experience (ATI-009) may consume the closed window
```

## 4.2 Stream rules

1. Outcome is a **stream**, not only a terminal event.  
2. Outcomes may begin **during** Execution.  
3. Outcomes may continue **after** Execution ends.  
4. One Action may produce **many** Outcomes.  
5. Failed Actions still produce Outcomes (including null/failed-intent body change, rejects affecting commitments, costs/time).  
6. Known Outcomes require Observation → Facts (then Assimilation for Understanding updates).  
7. Experience consumes **closed** Outcome stream windows — not live open streams as automatic Experience.

---

# 5. Lifecycle

## 5.1 Outcome element (cognitive)

```
Detected (Observed)
  → Evidenced (Fact-accepted)
       → Attributed (linked to Intent/Action; may be uncertain)
            → Closed (stable enough within a stream window)
  → Revised (later Facts correct scope/magnitude)
```

## 5.2 Outcome Stream window

```
Open (enactment path active or residual phase running)
  → Growing (elements accrue)
  → Closed (window ended for Experience candidacy)
  → (Residual may still append under a new/extended window only by explicit scope — default: closed windows do not silently reopen)
```

“Occurred in Reality but unobserved” is not a cognitive Outcome until Detected.

---

# 6. Relationships

| From | To | Rule |
|---|---|---|
| Action | Outcome Stream | Attempts couple to Reality; consequences may stream |
| Execution | Outcome Stream | Concurrent peers — not parent/child identity |
| Outcome | Execution | Never identical |
| Observation | Outcome | Known Outcomes enter via Observation of change |
| Facts | Outcome | Evidencing / provenance |
| Assimilation | Understanding strata | Belief updates from Outcome-evidencing Facts — not Outcome writing Understanding |
| Outcome | Understanding | **Never direct** |
| Outcome Stream (closed window) | Experience | Fuel boundary for ATI-009 |
| Outcome | Experience | Not automatic; not identical |
| Intent / Action | Outcome | Attribution targets |

### Cardinality

- One Action → many Outcomes  
- One Outcome → one primary enactment attribution when attributable (uncertain attribution allowed)  
- One Outcome Stream window → many Outcome elements  
- One stream → many Experiences possible (ATI-009)  

---

# 7. Invariants

1. Outcome is an evidence-bound consequence stream.  
2. Outcome runs concurrently with Execution.  
3. Outcome may continue after Execution ends.  
4. Execution is never Outcome.  
5. Fill is not an Outcome.  
6. Outcome never updates Understanding directly.  
7. Observation → Facts → Assimilation performs Understanding updates.  
8. One Action may produce many Outcomes.  
9. Failed Actions still produce Outcomes.  
10. Experience consumes closed Outcome stream windows.  
11. Not every Outcome becomes Experience.  
12. Attribution is required for Experience-grade use; uncertain/unintended attribution allowed.  
13. Successful Execution ≠ Goal-positive Outcome.  
14. Unobserved Reality consequences are not yet cognitive Outcomes.  
15. This document specializes UAIA Outcome; it does not redefine UAIA.

---

# 8. Must Never Overlap

| A | B | Rule |
|---|---|---|
| Execution | Outcome | Effector progress ≠ situational consequence |
| Fill / ack | Outcome | Effector report ≠ body/environment change record |
| Outcome | Experience | Consequence stream ≠ evaluated episode |
| Outcome | Understanding | Consequence record ≠ belief-state write |
| Outcome | Decision / Intent | Consequence ≠ choice / envelope |
| Outcome | Learning | Consequence ≠ improvement proposal |
| Stream window open | Experience | Live stream ≠ Experience |

---

# 9. Vocabulary Annex

| Forbidden phrase | Legal constitutional phrasing |
|---|---|
| “The fill is the outcome” | Execution reported a fill; Self Facts may evidence Inventory/Cash Outcomes after Assimilation |
| “Execution completed so outcome is done” | Execution ended; Outcome Stream may still be in residual phase |
| “No fill means no outcome” | Failed/rejected attempts still yield Outcomes (e.g. commitment state, null inventory change, costs) |
| “Outcome updated my Understanding” | Facts evidencing the Outcome were Assimilated into Understanding |
| “Every outcome is an experience” | Experience consumes closed, attributable, quality-gated stream windows only |
| “We observed liquidity as an outcome essence” | Observe manifestations; Outcome records situational deltas evidenced by Facts |
| “Successful execution = good outcome” | Execution success ≠ Goal/Intent success valence |

---

# 10. Freeze Statement

**Document:** ATI-008 Trading Outcome Architecture  
**Status:** **FROZEN**  
**Version:** 1.0  

This document specializes UAIA Outcome / Outcome Stream for trading under ATI-007. It introduces no new UAIA primitives and does not redefine Execution, Experience, Understanding, or Decision.

**Conformance sentence:**

> This architecture specializes UAIA v1.0 and ATI-007; it does not redefine them.

Breaking semantic changes require a new ATI-008 major version and board re-approval.

---

## End of ATI-008

**Execution progresses. Outcomes stream. Understanding waits for evidence. Experience waits for closed windows.**
