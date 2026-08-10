# ATI-006

# Trading Reasoning Architecture

**Status:** PROPOSED FOR FREEZE (Constitutional Review Board)  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI-001 … ATI-005 (FROZEN) · ATI-004 Decision Architecture  
**UAIA primitive specialized:** Reasoning  
**Non-scope:** Strategies, alpha formulas, indicator definitions, ML training, software, DDD, APIs, Decision/Intent/Action identity  

**Architectural gap closed:**

```
Market Understanding + Agent Situation
        ↓
Decision Frame
        ↓
Trading Reasoning   ← ATI-006
        ↓
Trading Decision
```

---

# 0. Aggressive Challenge Verdicts

| “Is Reasoning…?” | Verdict |
|---|---|
| Thinking (vague) | **Reject as definition** — slogan, not architecture |
| Inference | **Mode / core operation** — survives |
| Prediction | **Mode** — not identity of Reasoning |
| Comparison | **Core operation** — survives |
| Optimization | **Mode** (optional) — search among alternatives; does not commit Decision |
| Simulation | **Mode** — “what if” under constraints |
| Search | **Mechanism flavor of optimization/scenario** — not a peer primitive |
| Evaluation | **Of alternatives/opportunities** — yes as operation; not Experience evaluation ownership |
| Planning | **Mode** producing plan-shaped alternative packages — not Intent, not Decision |
| Analysis | Too vague — absorb into inference/comparison/explanation |
| Judgement | **Opportunity judgments** yes as outputs; final selection = Decision |
| All of the above as one dump | **Reject** |
| None | **Reject** — Reasoning is real |

**Most abused dump rejected:** signals, indicators, strategies, BUY/SELL, orders, Understanding edits, Fact minting, auto-Decision.

---

# 1. Constitutional Definition

**Trading Reasoning** is ATI’s Attention-bounded cognitive process that, given Market Understanding, Agent Situation, Decision Frame, and retrieved Memory, deliberates without choosing: it forms and compares alternatives, optional opportunity judgments, optional predictions and simulations, explanations, and reflective critiques — emitting Decision-ready deliberation products — and never minting Facts, never mutating Understanding by fiat, never selecting the committed Decision, never creating Intents or Orders.

**Constitutional sentence:**

> Reasoning deliberates. Decision selects. Understanding believes. Facts evidence. Intent enacts.  
> Trading Reasoning is deliberation specialized to markets — not a junk drawer for every clever computation.

**Not:** LLM identity · statistics identity · “AI thinking” marketing · strategy engine identity.

---

# 2. Reasoning Ontology

## 2.1 Primary Concepts

```
TRADING REASONING
├─ Reasoning Episode
│   ├─ Trigger
│   ├─ Scope / horizon
│   ├─ Premises cited
│   │   ├─ Market Understanding revision
│   │   ├─ Agent Situation revision
│   │   ├─ Decision Frame revision
│   │   └─ Memory retrieval refs
│   ├─ Modes engaged
│   ├─ Attention budget / stop conditions
│   ├─ Status (lifecycle)
│   └─ Outputs (legal set only)
├─ Alternative Candidates
├─ Opportunity Judgments
├─ Comparative Analyses
├─ Predictive Artifacts (optional)
├─ Simulation / Scenario / Counterfactual Artifacts (optional)
├─ Explanatory Artifacts
└─ Reflective Artifacts (metacognitive critique)
```

## 2.2 Derived / Supporting Concepts

| Concept | Status |
|---|---|
| Hypothesis | Material for alternatives/opportunities — not a peer primitive outside Reasoning |
| Ranking | Derived view over alternatives/opportunities |
| Probability estimate | Optional annotation on predictive artifacts — not Decision identity |
| Consistency check result | Assistive; Understanding consistency remains Understanding’s wrapper |
| Model application result | Method of inference — output must still be legal Reasoning artifact, not “model = Decision” |
| Uncertainty about options | Required annotation on serious deliberation outputs |

---

# 3. Reasoning Modes (Survival Challenge)

| Mode | Survives? | Role |
|---|---|---|
| **Inference** | **Yes — core** | Draw conclusions from premises without choosing |
| **Comparison** | **Yes — core** | Contrast alternatives under Frame/Goals |
| **Prediction** | **Yes — mode** | Optional foresight about consequences/paths — not mandatory gate; not Understanding |
| **Simulation** | **Yes — mode** | Structured “what happens if…” under assumed interventions/conditions |
| **Scenario generation** | **Yes — mode** | Bundle alternative futures/conditions for comparison |
| **Counterfactual** | **Yes — mode** | “Had we abstained / reduced…” — supports reflection & opportunity critique |
| **Explanation** | **Yes — mode** | Cite why an alternative/opportunity appears favored — non-authoritative vs Facts/Understanding |
| **Reflection** | **Yes — mode only** | Metacognitive critique of deliberation quality / bias / missing unknowns — not UAIA peer primitive |
| **Planning** | **Yes — mode** | Produce plan-shaped *alternative packages* for Decision to possibly select — not Intent |
| **Optimization** | **Yes — mode** | Search/score among alternatives — **does not commit** selection |
| **Hypothesis formation** | **Yes — operation** | Inside inference/opportunity formation |
| **Pattern completion** | **Conditional** | Allowed only as inference method; pattern totems are not constitutional outputs |
| **Conflict resolution** | **Assistive** | May propose reconciliations; cannot erase Facts; cannot force Understanding rewrite |
| **Consistency checking** | **Assistive** | May flag; Understanding owns consistency status via Assimilation |
| **Uncertainty reduction aiming** | **Intent of Attention+Reasoning** | Not a license to invent certainty |
| **Model selection / application** | **Method** | Not a Reasoning identity; outputs must be legal artifacts |
| **Signal generation** | **Reject as mode name** | Signals are banned smuggling |
| **Trade opportunity generation** | **Absorb** into Opportunity Judgment outputs — not a separate “signal factory” mode |
| **Probability estimation** | **Annotation capability** | Not the definition of Reasoning |
| **Ranking** | **Derived operation** | Over alternatives/opportunities |

**Simulation constitutional support:** **Yes.** “What happens if…” is first-class as a Reasoning mode, including stress of Agent Situation under hypothetical Actions — without executing Actions and without writing Situation.

---

# 4. What Belongs / Does Not Belong

## 4.1 Candidate Verdicts (inside Reasoning?)

| Candidate | Verdict |
|---|---|
| Inference | Yes |
| Comparison | Yes |
| Prediction | Mode yes |
| Simulation / Counterfactual / Scenario | Modes yes |
| Hypothesis formation | Yes |
| Explanation / Reflection | Modes yes |
| Planning / Optimization | Modes yes; no commit |
| Opportunity judgments | **Yes — primary legal output class** |
| Ranking / probability annotation | Yes as derived annotations |
| Uncertainty about options | Yes |
| Conflict flagging | Assistive yes |
| Consistency checking | Assistive yes |
| Model application | Method yes |
| Model selection | Method yes |
| Pattern completion | Method only |
| Signal generation | **No** |
| Indicator computation as Reasoning identity | **No** — may be Memory tools consumed, not ontology |
| BUY/SELL emission | **No** |
| Strategy authorship into production | **No** |

## 4.2 Absolutely Does NOT Belong

| Rejected | Why |
|---|---|
| Understanding | Premise; Reasoning consumes, does not own |
| Facts | Evidence layer; Reasoning never mints |
| Observation | Sensing |
| Decision | Selection / commit |
| Intent / Action / Execution / Outcome | Enactment path |
| Experience / Learning | Evolution path (Reflection may *assist* Experience evaluation; does not own Experience) |
| Knowledge / Memory identity | Memory is substrate; Reasoning retrieves, does not become Memory |
| Goals / Control | Norms/gates; Frame already binds them |
| Opportunity inside Understanding | ATI-003/004 forbid |
| BUY/SELL/Signals/Orders/Portfolio construction | Decision/Action/other docs |
| Risk limit definitions | Goals/Frame |
| Broker state | Agent Situation |
| Market Regime as Reasoning-owned belief | ATI-003 |

---

# 5. Reasoning Outputs (Legal Set Only)

Reasoning may legally emit:

1. **Alternative Candidates** (including Abstain-shaped alternatives)  
2. **Opportunity Judgments** (evaluative, scoped, uncertain, Frame-peeking — not permission)  
3. **Comparative Analyses** (rankings, tradeoff notes)  
4. **Predictive Artifacts** (optional)  
5. **Simulation / Scenario / Counterfactual Artifacts** (optional)  
6. **Explanatory Artifacts** (citations; non-authoritative)  
7. **Reflective Artifacts** (critique of deliberation quality / missing unknowns)  
8. **Option-uncertainty annotations**  
9. **Assistive flags** (premise conflict, thin evidence, stop-reason)  
10. **No-op / exhausted deliberation records** (failed or halted Reasoning)

Reasoning must **never** emit:

- Decisions (Committed/Selected as Decision objects)  
- Intents  
- Orders  
- Facts  
- Understanding mutations  
- Activated Competence  
- “Signals” as pseudo-Decisions  

**Where Reasoning stops / Decision begins:**

| Reasoning | Decision |
|---|---|
| Proposes and compares alternatives | **Selects** one eligible alternative |
| May recommend ranking | Ranking ≠ commit |
| Optimization search | Search ≠ authority-stamped Decision |
| Opportunity judgment “worth considering” | Eligibility + authority + commit |

**Selecting the best alternative is Decision — not Reasoning.**  
Reasoning may *nominate* a preferred alternative; Control + Decision Frame + Decision perform governed selection.

---

# 6. Relationships

### Understanding (ATI-003 / ATI-005)
- **Consumes** cited revisions as premises.  
- **Must not directly modify** Understanding.  
- If Reasoning concludes beliefs should change, it may only **prompt** re-Attention / new Observation / Assimilation pathways — never write beliefs by fiat.  
- Hard binds that need belief update remain Assimilation’s job (UAIA); Reasoning may assist analysis for Assimilation without owning Assimilation.

### Facts
- **Never create Facts.**  
- **Never reject Facts** as Truth Layer authority (Acceptance Boundary owns admissibility).  
- May **reinterpret** implications of Facts for alternatives (inference) without changing Fact commitments.  
- May flag that premises are thin/contested.

### Memory
- **Retrieves** analogs, standing Knowledge/Policy/Calibration, prior Experiences.  
- **Does not modify Memory** as Learning/Governance would.  
- **Does not create Knowledge** into force; may propose hypotheses that later become Experience/Learning fuel indirectly — not Knowledge activation.

### Decision Frame
- Premises eligibility/objectives/constraints for deliberation.  
- Reasoning peeks eligibility; does not rewrite Frame law.

### Decision
- Consumer of Reasoning outputs.  
- Only Decision creates Decision objects.

### Intent
- Downstream of Decision only. Reasoning planning mode ≠ Intent.

### Learning
- Distinct. Reflective mode may critique; Experience evaluation ownership remains Experience. Learning consumes Experiences, not raw Reasoning episodes (though rationale citations may appear in Experience).

---

# 7. Lifecycle (Reasoning Episode)

```
Triggered (Attention / Frame event / schedule / anomaly / Decision request)
  → Premises bound (Understanding, Agent Situation, Frame, Memory refs)
  → Modes engaged
  → Deliberating
  → Emit legal outputs | No-op | Halted (budget/stop)
  → Closed
  → (Optional) Superseded by newer episode on same scope
```

**Stop conditions (constitutional):** Attention budget exhausted; Frame expiry; Control halt; premises invalidated mid-flight; diminishing returns; explicit Abstain-nomination sufficient; contradiction storm without new evidence.

**Can Reasoning fail?** **Yes** — wrong inference, contradictory outputs, incomplete deliberation. Failure ⇒ halt/no-op/flag uncertainty — not fake Decision.

**Multiple simultaneous episodes?** **Yes, constitutionally** — different scopes/horizons/hypotheses — under Attention Control to prevent thrash. Outputs remain scoped; Decision collision handled per ATI-004/Control.

---

# 8. Properties (Every Reasoning Episode)

| Property | Required |
|---|---|
| Episode identity | Yes |
| Trigger | Yes |
| Scope / horizon | Yes |
| Premise refs (Understanding, Agent Situation, Frame) | Yes |
| Memory retrieval refs (when used) | Yes |
| Modes engaged | Yes |
| Status | Yes |
| Attention budget / stop reason | Yes |
| Legal outputs emitted (or explicit no-op) | Yes |
| Option-uncertainty / failure flags when material | Yes |
| Time bounds | Yes |

---

# 9. Opportunity (Reaffirmed)

| Question | Ruling |
|---|---|
| Should Opportunity exist? | **Yes** |
| Kind | Temporary **evaluative judgment** — Reasoning output |
| Decision input? | Yes, as deliberation product |
| Inside Understanding? | **Never** |
| Without Reasoning? | **Never** |
| Permission to act? | **Never** — only Decision→Intent→Control |

---

# 10. Prediction (Reaffirmed)

| Question | Ruling |
|---|---|
| Primitive? | **No** |
| Reasoning mode? | **Yes** |
| Decision support? | Optional |
| Understanding? | **No** |
| Knowledge? | Only if later governed Learning activates related competence — not by Reasoning emission |

---

# 11. Explanation & Reflection & Planning

- **Explanation:** Reasoning mode; cites premises; never outranks Facts/Understanding.  
- **Reflection:** Survives **only as Reasoning mode** (UAIA removed peer Reflection).  
- **Planning:** Reasoning mode producing plan-shaped alternatives; **Intent** remains Decision-derived enactment envelope; **Decision** selects whether any plan-alternative is chosen.

---

# 12. Common Architectural Mistakes (≥20)

1. Reasoning = entire AI system.  
2. Reasoning mints Facts.  
3. Reasoning writes Understanding directly.  
4. Reasoning auto-commits Decision.  
5. Optimization output treated as Decision.  
6. Signal factory labeled Reasoning.  
7. Indicators as Reasoning ontology.  
8. Opportunity in Understanding.  
9. Prediction required before Abstain.  
10. Planning mode emitting Intents.  
11. Reflection as peer primitive revived.  
12. Explanation as source of truth.  
13. Model object equated to Decision.  
14. BUY/SELL emitted from Reasoning.  
15. Portfolio construction inside Reasoning constitution.  
16. Risk limit authorship inside Reasoning.  
17. Simulation treated as Action.  
18. Simulation writing Agent Situation.  
19. No stop conditions (endless deliberation).  
20. Single unscoped global Reasoning mush.  
21. Ranking = authority.  
22. Probability estimate = Decision confidence.  
23. Memory writes from Reasoning.  
24. Learning bypass via “Reasoning updated the strategy.”  
25. Pattern totem as Opportunity without Frame peek/uncertainty.  

---

# 13. Freeze Recommendation

## Architecture Score

**8.8 / 10**

Clear stop boundary at Decision; Opportunity/Prediction/Simulation correctly demoted to modes/outputs; UAIA separations preserved.

## Weaknesses

1. “Model application” still tempts signal smuggling — vocabulary annex required.  
2. Multi-episode Attention arbitration needs operational annex later (not software here).  
3. Boundary between Reflective mode and Experience evaluation must stay policed.

## Missing Concepts?

None required as new UAIA primitives.  
Optional non-semantic annex: catalog of legal alternative-nomination shapes (aligned with ATI-004 families).

## Conceptual Risks

- Simulation theater mistaken for evidence.  
- Opportunity judgments treated as de facto Decisions.  
- Optimization worship.  
- Explanation overriding contested Understanding.

## Verdict

### **CONDITIONAL PASS → FREEZE**

Conditions:

1. Annex: Forbidden outputs (signal/BUY/order/Fact/Understanding-write).  
2. Reaffirm: **selection = Decision**; ranking ≠ commit.  
3. Reaffirm: Opportunity Reasoning-only; Prediction optional mode.  
4. Reaffirm: no direct Understanding/Memory/Situation writes.

**REJECT** any ATI-006 that:

- makes Reasoning mint Facts or Decisions;  
- places Opportunity in Understanding;  
- equates Reasoning with strategy/signal engines;  
- requires prediction before every Decision;  
- allows planning mode to create Intents.

---

## Final Constitutional Sentence

> Trading Reasoning is Attention-bounded deliberation over Understanding, Agent Situation, and Decision Frame that emits alternatives, opportunity judgments, and optional predictive/simulative/explanatory/reflective artifacts — never Facts, never Understanding mutations, never committed Decisions, never Intents or Orders. It deliberates; it does not decide.

---

## End of ATI-006
