# ATI-004

# Trading Decision Architecture

**Status:** PROPOSED FOR FREEZE (Constitutional Review Board)  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI-001 · ATI-002 · ATI-003 (FROZEN)  
**UAIA primitives specialized:** Decision Frame · Reasoning · Decision · Intent  
**Non-scope:** Strategies, alpha models, indicators, BUY/SELL rules, OMS, portfolio construction engines, risk-engine implementation, software, DDD, APIs, brokers-as-protocol, Action/Execution details beyond cognitive boundary  

**Primary question:**

> Given Market Understanding, Agent Situation, Goals, Control, and Decision Frame — how does ATI arrive at a governed trading Decision?

This document defines **cognitive decision architecture only**.

---

# 0. Board Challenge Verdicts (Up Front)

| Assumption | Verdict |
|---|---|
| Trading Decision = BUY/SELL | **Reject** — those are possible *alternative labels* inside a chosen alternative, not the ontology of Decision |
| Prediction required before every Decision | **Reject** — abstain and reduce/hedge can follow Understanding without a directional forecast |
| Abstain first-class | **Required** |
| Multiple simultaneous Decisions | **Allowed** (scoped); collisions resolved by Control/Frame |
| One Understanding → one Decision | **Reject** — one Understanding can yield many candidates; zero or many Decisions |
| Opportunity in Understanding | **Reject** (ATI-003) |
| Opportunity in Decision | **Reject as identity** — Decision is selection, not the opportunity object |
| Opportunity in Reasoning | **Accept** — as evaluative candidate judgments feeding Decision |
| Opportunity without Reasoning | **Reject** — raw Understanding is descriptive; opportunity is normative-evaluative |
| Reasoning without opportunity | **Allowed** — Reasoning may compare only abstain/stand-down alternatives |
| Decision owns probability | **Reject as required identity** — may cite Reasoning probabilities; Decision owns **Decision confidence** |
| Conviction | **Not a peer primitive** — at most informal composite of Decision confidence + eligibility strength; do not constitutionalize “conviction” |
| Every Decision requires Intent | **Reject** — abstain may produce no Intent or inhibit-Intent only |
| One Decision → many Intents | **Allowed** |
| Decision expiry / invalidation / revise / supersede / cancel | **Required** (UAIA) |
| Decision contains order details / broker / execution status | **Reject** |

---

# 1. Definition of Trading Decision

**Trading Decision** is ATI’s governed selection of an eligible trading alternative — including **Abstain** — under the active Trading Decision Frame, citing Market Understanding and Agent Situation revisions, bearing Decision confidence, eligibility proof, authority stamp, expiry, and rationale references.

It is **not** an order, not a broker instruction, not a signal, not a forecast, and not an Intent.

**Constitutional sentence:**

> A Trading Decision resolves what ATI will do or refuse to do now in markets — under eligibility and authority — not how effectors will tick, and not what the market will do next.

---

# 2. Trading Decision Principles

**TD-01 Selection ≠ Enactment** — Decision chooses; Intent packages; Action attempts.  
**TD-02 Abstain Is Competence** — Doing nothing is a Decision.  
**TD-03 Frame Before Choice** — No Decision without Decision Frame.  
**TD-04 Understanding Is Premise, Not Choice** — Market Understanding describes; it does not decide.  
**TD-05 Agent Situation Binds Autonomy** — Self-body truth constrains eligibility (headroom, effector health, agency mode).  
**TD-06 No Strategy Ontology Here** — Strategies may exist as Memory/Goals content elsewhere; Decision architecture does not define alpha.  
**TD-07 Traceability** — Every Decision cites Understanding revision, Frame revision, confidence, eligibility, authority, expiry, rationale refs.  
**TD-08 Supersession Not Mutation** — Revisions create new Decision identities.  
**TD-09 Invalidation on Premise Change** — Understanding/Frame shifts can invalidate non-closed Decisions.  
**TD-10 Intent Singularity of Parent** — Each Intent has exactly one parent Decision.  
**TD-11 Opportunity Is Evaluative, Not Descriptive** — Lives in Reasoning, not ATI-003.  
**TD-12 Prediction Optional** — Not a prerequisite for every Decision.  

---

# 3. Decision Frame Specialization (Trading)

Trading Decision Frame binds Goals + Control against **Market Understanding (ATI-003)** and **Agent Situation** (UAIA Agent Situation stratum).

| Frame element | Trading specialization |
|---|---|
| **F1 Active Objectives** | Mandate aims: capital preservation bounds, return-seeking posture, horizon preference, stand-down preferences |
| **F2 Horizon & Scope** | Session/overnight/expiry horizons; instrument/venue universe; Temporal Context from Market Understanding |
| **F3 Permission State** | Observe-only / paper / live / halted / armed (Control + Agency Mode) |
| **F4 Standing Constraints** | Risk policy, regulatory/session restrictions, house rules, concentration/loss limits as normative law |
| **F5 Eligibility** | Open/closed Decision families: e.g. new-risk ineligible, reduce-only, hedge-only, flat-by-close required, derivatives-overlay-sensitive families |
| **F6 Headroom Readings** | From Agent Situation: constraint utilization, margin/capacity, live commitments, performance heat — descriptive inputs into eligibility |
| **F7 Frame Expiry** | Rebuild on Understanding revision, kill/arm change, mandate change, clock landmarks |

**Invariant:** Decision Frame does not mutate Market Understanding. Fragility/tradability beliefs inform Eligibility; they are not Frame-native market beliefs.

---

# 4. Trading Reasoning

**Trading Reasoning** is Attention-bounded deliberation that, given Market Understanding, Agent Situation, and Decision Frame, produces:

- candidate **alternatives** (including abstain);  
- **opportunity judgments** (evaluative, optional);  
- comparisons, predicted consequences of alternatives (optional; not required for all Decisions);  
- uncertainty about options;  
- rationale materials for Decision citation.

Trading Reasoning **must never**:

- mint Facts;  
- rewrite Market Understanding by fiat;  
- emit orders;  
- activate Learning Candidates into production;  
- treat indicators/signals/alpha models as Decisions.

**Prediction:** a Reasoning *mode*, not a mandatory gate before Decision.

---

# 5. Decision Ontology

```
TRADING DECISION
├─ Chosen Alternative
│   ├─ Family (e.g. Abstain | Reduce | Hedge | Stand-down | Express | Rebalance-posture | …)
│   └─ Scoped description of the selection
│       (NOT order instructions)
├─ Scope (universe / book / horizon coverage)
├─ Status (lifecycle)
├─ Decision time
├─ Expiry
├─ Decision confidence
├─ Market Understanding revision ref
├─ Agent Situation revision ref
├─ Decision Frame revision ref
├─ Eligibility proof / satisfaction
├─ Authority / permission stamp
├─ Rationale citations (Reasoning refs, key Fact citations via Understanding)
└─ Lineage (supersedes / superseded-by)
```

**Alternative families are cognitive classes**, not exchange order types.  
Specializations may refine family catalogs without smuggling LIMIT/MARKET into Decision ontology.

---

# 6. Trading Intent Ontology

```
TRADING INTENT
├─ Parent Decision (exactly one)
├─ Enactment objective (what success means situationally)
├─ Scope
├─ Constraints (bounds Action must obey: size caps, urgency bounds, venue scope, reduce-only, etc.)
├─ Success condition
├─ Cancellation / invalidation conditions
├─ Horizon / expiry
├─ Authority stamp
├─ Status (lifecycle)
├─ Priority (when multiple Intents contend)
└─ Lineage (supersedes / superseded-by)
```

**Intent never becomes an Order.**  
Orders are Action specializations in later Action/Execution documents — outside ATI-004 identity.

Inhibit-Intent (“do not open new risk until T”) is allowed for stand-down Decisions.

---

# 7. Decision Properties (Minimum Permanent)

Required on every Trading Decision:

- Chosen alternative (incl. Abstain)  
- Scope  
- Status  
- Decision time  
- Expiry  
- Decision confidence  
- Market Understanding revision ref  
- Agent Situation revision ref  
- Decision Frame revision ref  
- Eligibility proof  
- Authority stamp  
- Rationale references  
- Lineage when revised  

**Not required / forbidden as Decision identity fields:** broker routing, account numbers, LIMIT/MARKET/STOP, fill status, indicator values, alpha scores as the Decision itself.

---

# 8. Decision Lifecycle

```
Selected
  → Committed
       → Enacted (Intent path started OR abstain enacted)
            → Closed
  → Expired
  → Cancelled
  → Invalidated
  → Superseded
  → Rejected (by Control before commit)
```

Pre-decisional alternatives live in Reasoning — not as Decisions.

---

# 9. Intent Lifecycle

```
Created
  → Authorized
       → Ready (optional wait gate)
            → Active ↔ Paused
                 → Completed | Abandoned
  → Cancelled | Expired | Superseded
```

No “Executed” state on Intent (Execution belongs downstream).

---

# 10. Relationship: Understanding → Reasoning

Market Understanding + Agent Situation supply descriptive premises.  
Reasoning reads them; does not own them.  
Contested/freshness-poor Understanding must increase alternative uncertainty and often favor Abstain eligibility already constrained by Frame.

---

# 11. Relationship: Reasoning → Decision

Reasoning proposes alternatives and opportunity judgments.  
Decision **selects** one eligible alternative (or Control rejects).  
Optimization/search inside Reasoning does not auto-commit Decision.

---

# 12. Relationship: Decision → Intent

Committed non-abstain Decisions authorize Intent formation.  
One Decision → many Intents allowed (staged/sleeves).  
One Intent → exactly one parent Decision.  
Alternative change ⇒ new Decision, not silent Intent rewrite of choice.  
Intent supersession may keep Decision fixed if choice unchanged and only enactment packaging changes.

---

# 13. Relationship: Intent → Action

Action attempts to satisfy Intent under constraints.  
ATI-004 ends at Intent constitution; Action/Execution are downstream UAIA primitives specialized later.  
Decision must not embed Action/Execution status as its identity.

---

# 14. Abstain Decision

**Abstain** is a first-class Trading Decision alternative family.

Meanings include (examples of cognitive posture, not strategies):

- no new risk;  
- stand down through event window;  
- refuse expression despite directional pressure when tradability/fragility/unknowns fail Goals;  
- maintain observe-only under Control.

Abstain may produce:

- **no Intent**, or  
- **inhibit-Intent**.

Abstain still requires full Decision properties (citations, confidence, expiry, eligibility, authority).

---

# 15. Opportunity Architecture

## Board ruling

| Home | Verdict |
|---|---|
| Understanding (ATI-003) | **Forbidden** |
| Decision | **Not the opportunity object** — Decision selects among alternatives |
| Reasoning | **Home** |
| Nowhere | Rejected — opportunities exist as evaluative judgments but must not pollute Understanding |

**Opportunity** = a Reasoning-produced evaluative judgment that a scoped environmental condition, relative to Goals/Frame, appears worth considering as a Decision alternative (or worth rejecting).

Properties of an Opportunity judgment (Reasoning artifact, not Decision):

- scope;  
- linked Understanding revision;  
- evaluative thesis (why it might matter);  
- uncertainty;  
- eligibility peek vs Frame (not final Decision);  
- expiry of the judgment.

**Opportunity without Reasoning:** illicit.  
**Reasoning without Opportunity:** allowed.  
**Opportunity ≠ permission to act:** only Decision + Intent + Control permit enactment.

---

# 16. Decision Confidence

- **Decision confidence** = confidence *in the choice*, distinct from Market Understanding confidence.  
- May be low while Understanding confidence is high (e.g. clear fragile regime → Abstain with high Decision confidence, or clear direction with poor tradability → Abstain).  
- Probability forecasts from Reasoning are optional citations, not required Decision fields.  
- **Conviction** is not a constitutional peer; do not freeze it as a third score.

---

# 17. Decision Invalidation

A non-closed Decision becomes **Invalidated** when:

- cited Market Understanding revision is superseded past invalidation conditions relevant to the choice;  
- Decision Frame expires or eligibility collapses;  
- Authority/Control kill/disarm contradicts permission stamp;  
- Agent Situation material break (effector truth/channel health) destroys premise;  
- Decision expiry passes.

Invalidated Decisions must not authorize new Intents; Active Intents must cancel/abandon per cancel conditions.

---

# 18. Decision Traceability

Every Trading Decision must be reconstructible as:

> Given Understanding U@t1, Agent Situation A@t1, Frame F@t1, Reasoning R refs, under Authority P — alternative X was selected with confidence C until expiry E.

Missing any mandatory citation ⇒ unconstitutional Decision.

---

# 19. Constitutional Invariants

1. Trading Decision specializes UAIA Decision; does not redefine it.  
2. Frame precedes Decision.  
3. Abstain is first-class.  
4. Decision ≠ Intent ≠ Action ≠ Execution ≠ Opportunity ≠ Understanding.  
5. Mandatory citations: Understanding, Agent Situation, Frame, confidence, eligibility, authority, expiry, rationale.  
6. Intent has exactly one parent Decision; success, cancel, expiry required.  
7. Intent never is an Order.  
8. Decision never owns broker/execution status identity.  
9. Opportunity lives in Reasoning only.  
10. Prediction is optional Reasoning mode.  
11. Multiple scoped Decisions allowed; Control resolves conflicts.  
12. Supersession/invalidation/cancel/expiry required; silent mutation forbidden.  

---

# 20. Must Never Contain (in Decision or Intent ontology)

BUY/SELL/LONG/SHORT as the *definition* of Decision · LIMIT/MARKET/STOP/TARGET as Decision fields · POSITION SIZE as Order microstructure inside Decision · ENTRY/EXIT order recipes · RISK % as OMS field inside Decision · BROKER · ACCOUNT · PORTFOLIO construction plan · ORDER · SIGNAL · ALPHA · FORECAST as Decision identity · PATTERN · MODEL OUTPUT as Decision · NEWS · INDICATOR · Execution fill state · Opportunity object inside Understanding  

*(Sizing *constraints* may appear on Intent as bounds Action must obey — not as exchange order tickets.)*

---

# 21. Common Architectural Mistakes

1. Decision = BUY/SELL button.  
2. Signal → Order with no Decision/Intent.  
3. Opportunity inside ATI-003.  
4. Forecast required before Abstain.  
5. Decision embedding LIMIT/MARKET.  
6. Intent with two parent Decisions.  
7. No expiry.  
8. Continuing Intent after Understanding invalidation.  
9. Equating Understanding confidence with Decision confidence.  
10. Treating Reasoning output as auto-Committed Decision.  
11. One global Decision for unrelated scopes.  
12. Calling conviction a third constitutional score.  
13. Strategy rules defined inside ATI-004 as if they were cognition.  
14. Decision knowing execution fills.  

---

# 22. Rejected Alternatives

| Alternative | Verdict |
|---|---|
| Decision ontology = order ticket | **Reject** |
| Opportunity in Understanding | **Reject** |
| Opportunity nowhere | **Reject** — place in Reasoning |
| Mandatory prediction gate | **Reject** |
| No abstain | **Reject** |
| Decision Frame optional | **Reject** |
| Intent optional for all non-abstain Committed Decisions | **Reject** — non-abstain Committed Decisions authorize Intent; abstain may omit |
| Conviction primitive | **Reject** |
| Portfolio construction inside Decision | **Reject** — later specialization docs |

---

# 23. Final Recommendation

**Freeze ATI-004** as the constitutional Trading Decision Architecture:

> ATI decides by assembling a Trading Decision Frame from Goals, Control, Market Understanding, and Agent Situation; Reasoning deliberates alternatives and optional opportunity judgments (including prediction only as an optional mode); Decision selects an eligible alternative including Abstain, with full traceability; Intent packages enactment envelopes with success, cancel, and expiry — never orders. Understanding remains descriptive; Opportunity remains evaluative inside Reasoning; Enactment remains downstream of Intent.

---

# Final Review

## Architecture Score

**8.7 / 10**

Institutional-grade cognitive decision constitution. Deduction for residual vocabulary risk (teams will still say “BUY decision”) and for Agent Situation still lacking its own frozen ATI doc (premise dependency).

## Remaining Weaknesses

1. **Agent Situation ATI doc** not yet frozen — ATI-004 depends on it; freeze ATI-004 only with explicit dependency note, or freeze Agent Situation immediately after.  
2. **Alternative family catalog** deliberately abstract — needs a non-semantic annex of allowed family names to prevent BUY/SELL smuggling.  
3. **Multi-Decision collision policy** stated as Control-resolved — needs sharper annex later without becoming portfolio construction.  

## Missing Concepts?

No missing UAIA primitive.  
**Not missing:** strategies/alpha — correctly excluded.  
**Pointer:** Action/Execution trading specialization remains future ATI docs.

## Conceptual Risks

- Smuggling order types into Intent “constraints.”  
- Treating opportunity judgments as de facto Decisions.  
- Using prediction absence as excuse for decision paralysis *or* prediction presence as forced action.  
- Invalidation storms causing Intent thrash without Control hysteresis (operational risk; Control concern).  

## Freeze Recommendation

**CONDITIONAL APPROVE FOR FREEZE** if:

1. Dependency on Agent Situation stratum is explicit.  
2. Annex: Forbidden Decision phrases → legal alternative-family language.  
3. Annex: Opportunity is Reasoning-only (reaffirm ATI-003 exclusion).  

**Do not approve** any ATI-004 that defines Decision as BUY/SELL/order ticket or places Opportunity in Understanding.

---

## End of ATI-004

**Frame binds. Reasoning deliberates. Decision selects — including nothing. Intent envelopes. Orders are not Decisions.**
