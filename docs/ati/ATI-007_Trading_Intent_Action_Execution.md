# ATI-007

# Trading Intent · Action · Execution Architecture

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI-004 Trading Decision Architecture  
**Also conforms to:** ATI-001 · ATI-002 · ATI-003 · ATI-005 · ATI-006  
**UAIA primitives specialized:** Intent · Action · Execution  
**Non-scope:** Outcome (ATI-008), Experience (ATI-009), OMS product design, broker protocols, software, DDD, APIs, strategy, portfolio construction  

**Constitutional chain specialized here:**

```
Decision (ATI-004)
  ↓
Trading Intent
  ↓
Trading Action
  ↓
Trading Execution
```

**Hard separation (frozen):**

> Decision chooses.  
> Intent is the enactment envelope.  
> Action is the attempt.  
> Execution is effector progress.  
> Order is not Intent.  
> Order is not Action.  
> Execution is not Outcome.

---

# 1. Definition

## 1.1 Trading Intent

**Trading Intent** is the actionable commitment envelope derived from exactly one Committed Trading Decision: a scoped, constrained, time-bounded directive that states what successful enactment means and what Trading Action is authorized to attempt — including Inhibit Intent for stand-down — and never an order ticket, broker instruction, or Execution report.

## 1.2 Trading Action

**Trading Action** is the attempt to affect Reality/effectors in accordance with one parent Trading Intent’s constraints and success conditions. It is the doing — not the choice, not the envelope, not the effector progress report, and not an order-as-ontology.

## 1.3 Trading Execution

**Trading Execution** is effector-side progress and terminal reporting of Trading Action attempts (accepts, rejects, partials, cancels, completions as reported by effectors). It is progress of the attempt — not situational Outcome, not Intent, and not Decision.

---

# 2. Scope

## In scope

- Specialization of UAIA Intent, Action, and Execution for trading  
- Abstain → no Intent or Inhibit Intent  
- Multi-Action under one Intent; single-Intent parent for each Action  
- Lawful update path after enactment attempts  

## Out of scope

- Outcome Stream (ATI-008)  
- Experience / Learning  
- Order-management product architecture  
- Broker wire formats  
- Understanding mutation  
- Strategy / alpha / signals  

---

# 3. Ontology

```
TRADING ENACTMENT
├─ Trading Intent
│   ├─ Parent Decision (exactly one)
│   ├─ Enactment objective
│   ├─ Scope
│   ├─ Constraints
│   ├─ Success condition
│   ├─ Cancellation / invalidation conditions
│   ├─ Horizon / expiry
│   ├─ Authority stamp
│   ├─ Status
│   ├─ Priority (when Intents contend)
│   ├─ Kind: Standard | Inhibit
│   └─ Lineage (supersedes / superseded-by)
├─ Trading Action
│   ├─ Parent Intent (exactly one)
│   ├─ Attempt identity
│   ├─ Attempt parameters (within Intent constraints)
│   ├─ Status
│   └─ Time bounds
└─ Trading Execution
    ├─ Parent Action (attempt ref)
    ├─ Effector progress / terminal status
    ├─ Reported partials / rejects / completes / cancels
    └─ Time bounds
```

### Notes (non-new concepts)

- **Order** may appear in trading practice as a *form of Action instruction*; it is **not** a constitutional peer of Intent or Action.  
- **Inhibit Intent** carries objective “do not open / do not increase risk…” with success = constraint held through horizon.  
- Abstain Decision may produce **no Intent** or an **Inhibit Intent**.

---

# 4. Lifecycle

## 4.1 Trading Intent

```
Created
  → Authorized
       → Ready (optional wait gate)
            → Active ↔ Paused
                 → Completed | Abandoned
  → Cancelled | Expired | Superseded
```

Inhibit Intent uses the same lifecycle; “Completed” means inhibit success condition held through horizon.

## 4.2 Trading Action

```
Armed
  → Attempting
       → Attempt succeeded path | Attempt failed path | Stopped
```

Stopped when parent Intent is Cancelled / Expired / Superseded / Completed / Abandoned, or Control denies permission.

## 4.3 Trading Execution

```
Started
  → In progress
       → Completed | Failed | Cancelled | Partial-terminal
```

Execution lifecycle reports effector progress only.

---

# 5. Relationships

| From | To | Rule |
|---|---|---|
| Decision | Intent | Committed Decision authorizes Intent; Abstain → no Intent or Inhibit Intent |
| Intent | Decision | Exactly one parent Decision per Intent |
| Intent | Action | One Intent may authorize many Actions |
| Action | Intent | Exactly one parent Intent per Action |
| Action | Execution | Attempts produce Execution progress |
| Execution | Action | Reports effector progress of the attempt |
| Execution | Outcome | Concurrent / downstream — **not identical** (ATI-008) |
| Action / Execution | Understanding | **Never direct** |
| Enactment effects | Understanding strata | Only via Observation → Facts → Assimilation |

### Cardinality (frozen)

- One Decision → many Intents (allowed)  
- One Intent → one parent Decision  
- One Intent → many Actions  
- One Action → one Intent  
- One Action → many Execution progress records over time  

### Failure survival

- Action/Execution failure does **not** automatically destroy Intent.  
- Intent may retry (new Actions), pause, abandon, or await new Decision — per Intent cancel/success conditions and Control.

---

# 6. Invariants

1. Decision chooses; Intent does not choose.  
2. Intent is the enactment envelope; Action is the attempt; Execution is effector progress.  
3. Every normal Intent has exactly one parent Decision.  
4. Every Action has exactly one parent Intent.  
5. Intent never is an Order; Action identity never is an Order.  
6. Execution never is Outcome.  
7. Action never updates Understanding directly.  
8. Body/world belief updates occur only through Observation → Facts → Assimilation.  
9. One Intent may produce many Actions; one Action never satisfies many Intents.  
10. Action without Intent is forbidden on the normal path.  
11. Abstain produces no Intent or an Inhibit Intent — not a BUY/SELL Action.  
12. Silent mutation forbidden; use supersession / new attempts / lineage.  
13. Intent requires success condition, cancellation/invalidation conditions, and expiry.  
14. Control may stop Action; stop is not a redefinition of Intent.  
15. This document specializes UAIA; it does not redefine UAIA.

---

# 7. Must Never Overlap

| A | B | Rule |
|---|---|---|
| Decision | Intent | Selection ≠ enactment envelope |
| Intent | Action | Envelope ≠ attempt |
| Action | Execution | Attempt ≠ effector progress report |
| Intent | Order | Envelope ≠ order ticket |
| Action | Order | Attempt ontology ≠ order-as-constitution |
| Execution | Outcome | Effector progress ≠ situational consequence stream |
| Intent | Understanding | Envelope ≠ belief-state |
| Action | Understanding | Attempt ≠ belief write |
| Execution | Experience | Progress ≠ evaluated episode |
| Inhibit Intent | Market Understanding | Stand-down envelope ≠ environment belief |

---

# 8. Vocabulary Annex

| Forbidden phrase | Legal constitutional phrasing |
|---|---|
| “The decision is a market order” | Decision selected an alternative; Intent defined enactment constraints; Action attempted under those constraints |
| “Send the Intent to the broker” | Action attempt via effector path; Execution reports ack/progress |
| “Intent filled” | Execution reported complete/partial; Outcome stream may record situational change (ATI-008) |
| “Action updated my positions” | Self Observation → Facts → Assimilation updated Agent Situation |
| “Execution is the outcome” | Execution is effector progress; Outcome is situational consequence |
| “Abstain means no Decision” | Abstain is a Decision; it may create no Intent or an Inhibit Intent |
| “One order serves two Intents” | Forbidden — one Action → one Intent |
| “Order = Action = Intent” | Forbidden collapse |

---

# 9. Freeze Statement

**Document:** ATI-007 Trading Intent · Action · Execution Architecture  
**Status:** **FROZEN**  
**Version:** 1.0  

This document specializes UAIA Intent, Action, and Execution for trading under ATI-004. It introduces no new UAIA primitives and does not redefine Decision, Understanding, Outcome, or Experience.

**Conformance sentence:**

> This architecture specializes UAIA v1.0 and ATI-004; it does not redefine them.

Breaking semantic changes require a new ATI-007 major version and board re-approval.

---

## End of ATI-007

**Decision chooses. Intent envelopes. Action attempts. Execution reports. Orders are not constitution. Understanding updates only through evidence.**
