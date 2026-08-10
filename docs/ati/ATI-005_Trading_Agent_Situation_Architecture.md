# ATI-005

# Trading Agent Situation Architecture

**Status:** PROPOSED FOR FREEZE (Constitutional Review Board)  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI-001 · ATI-002 · ATI-003 · ATI-004 (Provisional)  
**UAIA primitive specialized:** Understanding — **Agent Situation stratum only**  
**Completes:** Stratified Understanding for ATI (Environment = ATI-003; Agent = ATI-005)  
**Non-scope:** Portfolio software, OMS, accounting systems, risk-engine implementation, strategies, software, DDD, APIs  

**Primary sentence defined:**

> “I understand my own trading body.”

---

# 0. Aggressive Challenge Verdicts

| Candidate | Verdict |
|---|---|
| Agent Situation = Portfolio | **Reject as identity** — Portfolio is loose language for inventory set |
| Agent Situation = Account | **Reject as identity** — account is effector identity, not the belief-state |
| Agent Situation = Broker | **Reject** — broker is gateway; acknowledgments feed Situation |
| Agent Situation = Capital only | **Reject** — necessary but incomplete |
| Agent Situation = Execution state | **Reject** — Execution ≠ Situation |
| Agent Situation = Risk | **Reject as identity** — see §10 |
| Agent Situation = Constraints (definitions) | **Reject** — definitions are Goals/Frame/Policy |
| Agent Situation = Inventory only | **Reject** — necessary but incomplete |
| Agent Situation = Exposure | **Derived**, not peer essence |
| Agent Situation = Margin only | **Reject** — part of capacity body |
| Agent Situation = Permissions law | **Reject** — Goals/Control; Agency Mode *belief* is Situation |
| Agent Situation = all of the above mashed | **Reject** — mush ontology |
| Agent Situation = none of them | **Reject** — real body beliefs exist |

**Risk (biggest challenge):**  
- Market fragility → ATI-003  
- Constraint **definitions** → Goals / Decision Frame / Policy  
- Constraint **utilization** / book heat / headroom → **Agent Situation**  
- Kill/arm law → Control  
- “Risk” as omniscient blob → **nowhere as a single primitive**

---

# 1. Constitutional Definition

**Trading Agent Situation** is ATI’s present, evidence-bound, confidence-aware belief-state about its own trading body and agency: what it holds, what funding/capacity it has, what it has committed, what effectors acknowledge, what agency mode it is in, how healthy its self-channels are, how much of its mandate constraints it has consumed, and how its session performance path stands — with freshness, unknowns, consistency, and invalidation.

It answers **“What is happening inside ATI?”**  
It does **not** answer **“What is happening in the market?”** (ATI-003).

**UAIA conformance:** Agent Situation is a stratum of Understanding — same belief-state laws (evidence binding, epistemic wrappers, no silent mutation). ATI-005 does not redefine Understanding.

---

# 2. Ontology

## 2.1 Primary Categories

```
TRADING AGENT SITUATION
├─ Body
│   ├─ S1 Inventory
│   ├─ S2 Cash & Balances
│   ├─ S3 Capital Posture
│   └─ S4 Margin & Capacity
├─ Commitments
│   ├─ S5 Live Commitments
│   └─ S6 Settlement & Pending Clearance
├─ Effector
│   ├─ S7 Effector Truth
│   └─ S9 Effector Channel Health
├─ Agency
│   └─ S8 Agency Mode
├─ Mandate Consumption
│   ├─ S10 Constraint Utilization
│   └─ S11 Performance State
└─ Epistemic Wrapper (mandatory)
    ├─ Confidence
    ├─ Unknown Set
    ├─ Freshness / As-Of
    ├─ Consistency Status
    └─ Invalidation Conditions
```

| ID | Primary belief | Meaning |
|---|---|---|
| **S1 Inventory** | What ATI holds | Instruments, quantities, sides, open risk units as believed |
| **S2 Cash & Balances** | Monetary balances | Settled/unsettled cash distinctions when material |
| **S3 Capital Posture** | Economic/mandate capital skin | Assigned/usable capital posture — not identical to cash |
| **S4 Margin & Capacity** | Collateral & capacity to add risk | Margin used/excess; capacity beliefs |
| **S5 Live Commitments** | Unresolved market commitments | Working orders, partials, queued instructions as believed |
| **S6 Settlement & Pending Clearance** | Not-yet-finished obligations | T+N, pending assigns/exercises, unresolved breaks |
| **S7 Effector Truth** | Broker/custodian-acknowledged state + reconciliation | Aligned / discrepant / unknown |
| **S8 Agency Mode** | How ATI is currently allowed to act as sensed | Observe-only / paper / live / halted / armed |
| **S9 Effector Channel Health** | Health of Self/Authority effector observation paths | Connectivity, ack latency, silence on self-paths |
| **S10 Constraint Utilization** | How much of mandate limits is consumed | Headroom vs Goals/Frame limits — not the limits themselves |
| **S11 Performance State** | Own session outcome path | Realized/unrealized path, drawdown from reference, error heat |

## 2.2 Derived Categories (not peers)

| Derived | From | Notes |
|---|---|---|
| **Exposure** (gross/net/factor/beta-like aggregates) | S1 + Environment marks (ATI-003/Facts) | Never World-native “exposure of the market” |
| **Concentration** | S1 / Exposure | |
| **Buying Power** (often) | S4 + standing rules | Rule outputs believed via Self Facts when quoted |
| **Mark-to-market portfolio value** | S1+S2+marks | Curiosity metric; not Capital Posture identity |
| **“Portfolio”** | Language for Inventory set | Not a peer category |
| **Latent double-risk** | S1+S5 | Diagnostic derived view |

---

# 3. Boundary Rules

## 3.1 What Belongs

S1–S11 + epistemic wrapper + derived views above.

## 3.2 Candidate Verdicts (complete)

| Candidate | Verdict |
|---|---|
| Portfolio | Language only → S1 |
| Capital | S3 (posture); not Environment |
| Cash | S2 |
| Inventory | S1 |
| Buying Power | Usually derived from S4 |
| Margin / Collateral | S4 |
| Open Commitments | S5 |
| Pending Execution | S5 (live) / Execution progress distinct |
| Broker Acknowledged State | S7 |
| Settlement State | S6 |
| Constraint Utilization | S10 |
| Agency Mode | S8 |
| Health (effector self-channels) | S9 |
| Clock Dependence | Temporal *effects on body* via Clock Facts → may update S5/S6/S8 timing beliefs; Clock realm itself is not Situation content |
| Authority Effects | Authority Observations primarily update Goals/Control; Situation may update S8 when arm/halt is sensed |
| Universe Ownership | Mandate universe = Goals/Frame; Situation does not own universe law |
| Exposure | Derived |
| Fees | May appear as cash/capital deltas via Outcomes/Facts — not a peer category |
| Risk | **Not a peer** — see §10 |
| Tradability | **ATI-003** (Environment) |
| Strategy | Memory/Goals — **never** Situation |
| Intent | Decision path — **never** Situation (until commitments appear as S5 via Facts) |
| Orders (as tickets) | Not Situation ontology; order *acks* → S5 via Self Facts |
| Opportunity | Reasoning (ATI-004) |
| Prediction | Reasoning |

## 3.3 What Absolutely Does NOT Belong

| Rejected | Why |
|---|---|
| **Risk** (as blob) | Split across ATI-003 fragility, Goals/Frame definitions, S10 utilization, Control kill |
| **Opportunity** | Reasoning |
| **Strategy / Signals / Prediction** | Not body beliefs |
| **Market Regime / Volatility / Liquidity / Sentiment** | ATI-003 |
| **Intent / Decision** | Choice path; Situation is descriptive self-belief |
| **Execution** | Effector progress ≠ body belief-state |
| **Learning / Knowledge / Memory / Reasoning** | Other UAIA primitives |
| **Understanding** (as container identity) | Situation *is a stratum of* Understanding — not a rival primitive |
| **Goals / Control** (as law) | Normative/control; Situation holds sensed mode & utilization |
| **Environment instruments/venues as owned world** | ATI-001/003 |

**Can anything belong to both Market Understanding and Agent Situation?**  
**Almost never as the same belief.**  
Marks from Environment update *calculations feeding* Exposure/Performance, but the **Inventory belief** remains Agent Situation; **Regime belief** remains Market Understanding.  
Shared *inputs* (Facts) may inform both strata differently. Dual-homing the same belief proposition is forbidden.

---

# 4. Relationships

### Observation → Agent Situation
Realms that update Agent Situation **after** Facts → Assimilation:

| Realm | Role |
|---|---|
| **Self** | Primary — inventory, cash, margin, order/fill acks, broker snapshots |
| **Channel** | Self/effector path integrity → S9; unknowns on S1/S5/S7 |
| **Clock** | Session/settlement landmarks affecting S5/S6/S8 timing beliefs |
| **Authority** | Primarily Goals/Control; may sense-update S8 (armed/halted) |
| **World** | Does **not** directly write Inventory; World marks may later affect derived Exposure/Performance **via** Assimilation using World Facts + S1 — Environment beliefs stay in ATI-003 |

### Facts → Assimilation → Agent Situation
**Mandatory path for known Situation updates.**  
Agent Situation is belief-state; it changes through Assimilation of accepted Self (and related) Facts — UAIA law.

### Environment Understanding (ATI-003)
Descriptive outside world. Orthogonal stratum. Provides marks/conditions for derived Exposure/Fragility-informed *eligibility later* — not Situation content.

### Decision Frame (ATI-004)
Agent Situation contributes **descriptive headroom and permission reality**:

- S10 utilization / headroom  
- S4 capacity  
- S5 live commitments (latent risk)  
- S7 discrepancy / S9 health (trust of body)  
- S8 agency mode  
- S11 performance heat  

**Situation does not create eligibility law.**  
It **describes** consumption and body truth; Frame **combines** that with Goals/Control to produce Eligibility.  
Situation alone never authorizes action.

### Decision / Intent
May cite Agent Situation revision.  
Pending Intent is **not** Situation until Action path yields Self Facts into S5/S1.

### Action → Agent Situation
**No Direct Write.**

Constitutional path:

```
Action → (Reality/effectors)
      → Observation (Self/Channel/…)
      → Facts
      → Assimilation
      → Agent Situation
```

Wishing, intending, or attempting does not update Situation. Only evidenced body reports do.

### Execution vs Agent Situation
**Completely different.**  
Execution = effector attempt progress.  
Situation = believed body/agency state.  
A fill Execution report, once Observed→Fact→Assimilated, updates S1/S2/S5/etc. Execution identity ≠ Situation identity.

### Outcome
Outcomes that change Agent Situation dimensions (inventory, cash, exposure consequences, fees) update Situation **only via Observation→Facts→Assimilation**.  
Failed/partial Actions still produce Outcomes; Situation may remain unchanged when intended change failed — that unchanged-body Outcome is still real for Experience, and Situation reflects evidence (e.g., reject ack → S5 update, Inventory unchanged).

### Experience / Learning
Experience may evaluate body Outcomes; Learning must not directly edit Situation. Situation changes from evidence, not from lessons.

---

# 5. State Properties (Every Live Agent Situation)

| Property | Required |
|---|---|
| Content beliefs S1–S11 (as applicable) | Yes |
| Confidence (global + material families) | Yes |
| Unknown Set | Yes |
| Freshness / As-Of | Yes |
| Consistency Status | Yes |
| Invalidation Conditions | Yes |
| Evidence bindings (or thin/unsupported marks) | Yes |
| Revision identity | Yes |
| Scope (which books/accounts/venues of self claimed) | Yes |

### Can Agent Situation be wrong?
**Yes.**

How: stale Self Facts; broker disagreement (S7 contested); missed fills; channel silence mistaken for flatness; corporate-action mishandling; settlement breaks.

**Conflicting Situation beliefs:** allowed as Contested consistency (e.g., internal Inventory vs Effector Truth).  
**Resolution:** not by erasing Facts — by Attention to reconcile, integrity Facts, Assimilation weaken/unknown↑, and Control blocking Decision/Action when material.

### Can it become stale?
**Yes.** Especially under Channel degradation, delayed broker acks, overnight gaps. Freshness decay must raise unknowns / lower confidence.

---

# 6. Deep Challenges Expanded

### §10 Risk
| Risk sense | Home |
|---|---|
| Environment fragility | ATI-003 M15 |
| Limit definitions (max loss, max leverage) | Goals / Decision Frame / Policy |
| Current utilization / headroom / heat | **S10 / S11** |
| Kill switch | Control |
| “Risk engine” software | Out of constitutional scope |

### §11 Constraints
**Definitions = normative (Goals/Frame/Policy).**  
**Utilization = descriptive (Agent Situation S10).**  
General principle: **law vs consumption** never share one object.

### §12 Capital flavors
| Flavor | Home |
|---|---|
| Capital posture / assigned skin | S3 |
| Cash available/settled/unsettled | S2 |
| Capital committed in live orders | reflected via S5 + capacity |
| Capital pending settlement | S6 |
| Reserved (mandate reserve) | often Goals/Frame reservation law + S10 consumption |
| Capital change as consequence | Outcome → Facts → Situation deltas |

Not Execution identity.

### §13 Broker
| Phenomenon | Home |
|---|---|
| Broker ack of position/order/fill | Observation Self → Facts → S1/S5/S7 |
| Broker latency/silence/disagreement flags | Observation Channel (+ Self) → S9/S7 |
| Broker rejection report | Self Fact → S5/S7 |
| Broker as Venue | **Forbidden** (ATI-001) |
| Broker health belief | S9 / S7 — Situation |
| Raw latency spike percept | Observation first |

---

# 7. Common Architectural Mistakes (≥20)

1. Equating Agent Situation with portfolio software.  
2. Putting ATI capital in Trading Environment.  
3. Treating broker as the market.  
4. Writing Situation directly from Action.  
5. Equating Execution with Situation.  
6. Putting Pending Intent into Situation.  
7. Putting Opportunity into Situation.  
8. Putting Market Regime into Situation.  
9. Treating Risk as one Situation peer.  
10. Storing max leverage inside Situation as if it were utilization.  
11. Ignoring Live Commitments (latent double risk).  
12. Trusting Inventory without Effector Truth.  
13. Ignoring Channel silence as “flat and fine.”  
14. Mixing ATI-003 Tradability into Situation.  
15. Updating Situation from Reasoning wishfulness.  
16. No freshness on body state.  
17. No contested state for broker disagreement.  
18. Agency Mode missing (paper mind acting live).  
19. Exposure treated as observed World Fact.  
20. Settlement ignored (“filled = finished”).  
21. Decision Frame reading Situation as eligibility *law*.  
22. Learning editing Inventory beliefs directly.  
23. Dual-homing Regime and Inventory as one belief.  
24. Using “account” as ontology instead of S1–S11.  
25. Treating fees/PnL path as Market Understanding.  

---

# 8. Freeze Recommendation

## Architecture Score

**8.9 / 10**

Completes stratified Understanding. Clear law-vs-consumption and Execution-vs-Situation separations. Deduction for residual “risk” vocabulary abuse risk and ATI-004 still provisional.

## Verdict

### **CONDITIONAL PASS → FREEZE**

Conditions:

1. Explicit conformance note: ATI-005 + ATI-003 = complete ATI Understanding strata.  
2. Vocabulary annex: forbidden phrases (“observe my risk,” “portfolio understanding of NIFTY regime”) → legal Situation/Environment phrases.  
3. ATI-004 dependency satisfied: Frame headroom readings map to S4/S5/S7/S8/S9/S10/S11.  
4. Reaffirm Action↛Situation direct write path.

**REJECT** any version that:

- merges Agent Situation with Market Understanding;  
- places Opportunity/Strategy/Prediction inside Situation;  
- equates Execution with Situation;  
- allows Action to mutate Situation without Observation→Facts→Assimilation;  
- treats Risk policy definitions as Situation content.

---

## Final Constitutional Sentence

> Trading Agent Situation is ATI’s present belief-state about its trading body and agency (S1–S11 + epistemic wrapper). Market Understanding is the world; Agent Situation is the self. Limits are law; utilization is Situation. Execution is progress; Situation is believed body. Action does not write Situation — evidence does.

**That completes the second half of ATI’s Understanding.**

---

## End of ATI-005
