# PRODUCT-001

# Product Capability Architecture Review

**Document:** PRODUCT-001_Product_Capability_Architecture_Review  
**Version:** 1.0  
**Status:** Architecture Review (NOT automatically frozen)  
**Parents (frozen, not redesigned):** UAIA v1.0 · ATI Constitution · ATI-001…009 · DDD-000…010  
**Auditor posture:** Independent hostile Enterprise / Product Architecture Review Board  

**Scope:** Challenge ATI’s **product capabilities** as long-term business architecture only.  

**Out of scope:** UAIA cognition redesign · ATI cognitive doc redesign · DDD mechanics redesign · software · APIs · infrastructure · databases · implementation.

**Important distinction enforced by this review:**

| Layer | Role | This review |
|---|---|---|
| UAIA / ATI docs | Cognitive constitution | Untouchable |
| DDD-000…010 | Semantic ownership mechanics | Untouchable as mechanics |
| DDD-001 BC-01…12 | Candidate **product capability** partition | **Under attack** as product architecture |

DDD-001 may remain correct as *semantic ownership*. This review asks whether those ownership boxes are the right **permanent product capabilities**.

---

# 1. Product Identity

## Hostile challenge

Marketing temptation: “Autonomous Trading Platform / Trading OS / always-on brain.”  
Engineering temptation: “OMS with AI.”  
Research temptation: “Market Intelligence terminal.”

## Verdict

**ATI’s real product identity is:**

> **Autonomous Decision Intelligence over Markets** — a continuously maintained Market Understanding + Agent Situation, governed Decision/Intent path, optional Enactment, and governed Learning — not a broker, not a signal shop, not ChatGPT-for-trading, and not a Trading Operating System that owns exchanges.

### Q2 rulings

| Candidate identity | Verdict |
|---|---|
| Market Intelligence only | **Too narrow** — ignores Agent Situation, Decision, Learning |
| Decision Intelligence | **Core yes** — but incomplete without always-on Understanding |
| Trading System / OMS | **Reject as center** — Enactment is optional mode |
| Trading Operating System | **Reject** — OS envy; confuses platform (AI-TOS) with product |
| Autonomous Trading Platform | **Vague** — acceptable marketing, weak architecture center |
| **Autonomous Decision Intelligence over Markets (ADI/ATI)** | **Selected** |

### Center of gravity (Q18)

**Yes — there is a single center of gravity:**

> **Present Understanding (Market Understanding + Agent Situation), consumed by governed Decision.**

Everything else is either:

- **input machinery** (Environment reference, Sensing, Evidence),  
- **deliberation support** (Reasoning),  
- **optional agency** (Enactment / Consequence),  
- **evolution** (Experience / Competence Evolution),  
- **normative envelope** (Mandate).

If Understanding+Decision are wrong, the product is wrong — regardless of brokers or models.

---

# 2. Capability Evaluation Matrix

Evaluation of DDD-001 BC-01…12 as **product capabilities** (not as DDD legality).

Legend: **G** = genuine long-term capability · **P** = projection/supporting · **T** = temporary computation · **N** = should not be a product capability / BC-as-product

| Capability (DDD-001) | Ownership | Semantic stability | Business permanence | Cognitive alignment | AI-native | Scale/org | 20y survival | Verdict |
|---|---|---|---|---|---|---|---|---|
| BC-01 Environment Reference | Strong | High | High | Supports Observation/Understanding | Neutral | Clear steward | **Yes** | **G** |
| BC-02 Market Sensing | Strong | High | High | Observation | High | Clear | **Yes** | **G** |
| BC-03 Evidence Registry | Strong | High | High | Facts | High | Clear | **Yes** | **G** (thin but real) |
| BC-04 Market Intelligence | Strong | High | **Highest product** | Understanding Env | Highest | Clear | **Yes** | **G — CORE** |
| BC-05 Agent Ledger | Strong | High | High (if agency) | Understanding Agent | High | Clear | **Yes** (even if exec optional — paper body still exists) | **G — CORE** |
| BC-06 Mandate Authority | Strong | High | High | Goals/Frame law | Medium | Clear | **Yes** | **G** |
| BC-07 Deliberation | Strong | Medium (dump risk) | Medium–High | Reasoning | High | Fuzzy org | **Yes if fenced** | **G with kill risk** |
| BC-08 Decision Authority | Strong | High | **Highest product** | Decision | Highest | Clear | **Yes** | **G — CORE** |
| BC-09 Trade Enactment | Strong | High | Conditional | Intent/Action/Execution | Medium | Clear | **Yes as optional agency capability** | **G (optional plane)** |
| BC-10 Consequence | Strong | High | High with agency; weaker if never acts | Outcome | High | Clear | **Yes** | **G** |
| BC-11 Experience | Strong | High | High | Experience | High | Clear | **Yes** | **G** |
| BC-12 Competence Evolution | Strong | High | High | Learning/Gov | High | Clear | **Yes** | **G** |

### Answers woven

**Q4 Genuine ownership boundaries:** BC-01,02,03,04,05,06,08,09,10,11,12 — and BC-07 if prevented from becoming strategy landfill.

**Q5 Merely projections:** Dashboard “Market Overview,” “PnL board,” “Opportunity cards,” “Risk heatmaps” as **product surfaces** — not capabilities. DDD Read Models serve them; they are not BCs.

**Q6 Temporary computations:** Indicators, model scores, pattern matches, ranking sorts, simulation runs — **computations inside Deliberation/Research**, not permanent capabilities.

**Q7 Should never be Bounded Contexts (as product capabilities):** Presentation/UI · Microservice-shaped “Reasoning Service” · “Signal Factory” · “Strategy Runtime” as peer of Understanding · “Broker Adapter” as business capability (ACL/tech, not product capability) · Time-as-BC · Knowledge-as-BC duplicate of Competence Evolution / Memory.

---

# 3. Capability Kill Board

| Candidate | Kill / Keep | Why |
|---|---|---|
| Trading OS capability | **KILL** | Platform confusion with AI-TOS |
| Signal capability | **KILL** | Forbidden vocabulary; not a business capability |
| Indicator capability | **KILL** | Computation |
| Broker capability (as product BC) | **KILL as capability** | External system + ACL; not ATI product ownership of meaning (Enactment/Sensing already cover agency/sensing) |
| Presentation / Dashboard capability | **KILL as BC** | Surface, not capability |
| Opportunity capability (standalone) | **KILL as BC** | Lives inside Deliberation as judgments — not a product pillar |
| Strategy capability (standalone peer) | **KILL as peer BC** — see §4/§9 | Must not rival Understanding/Decision; may exist as **governed competence content**, not a capability equal to Market Intelligence |
| “AI Model Ops” capability | **KILL as product BC** | Implementation/model lifecycle ≠ product capability (Competence Evolution covers governed improvement) |
| Evidence Registry | **KEEP** | Easy to under-rate; without it ATI becomes vibes |
| Deliberation | **KEEP with muzzle** | Necessary; dangerous if unbounded |
| Consequence | **KEEP** | Even paper trading needs consequence language |
| Experience vs Competence Evolution split | **KEEP split** | Fuel vs proposal/activation — product-critical separation |

---

# 4. Missing Capabilities

Hostile search for gaps **at product capability level** (not new UAIA primitives):

| Candidate missing capability | Verdict |
|---|---|
| **Research / Experimentation** (offline thesis lab) | **Missing as first-class product capability** — currently smashed into Deliberation (BC-07) or informal. Online deliberation ≠ multi-day research programs. |
| **Simulation / Counterfactual Lab** | **Missing as product capability** — exists as Reasoning *mode*; product needs a durable capability for paper worlds / stress programs without polluting live Decision. May be a **split from Deliberation** or a named sub-capability under Research. |
| **Trust & Audit / Explainability Product** | **Partially missing** — scattered across Evidence, Decision citations, Experience. Not necessarily a BC, but a **product capability surface** for institutional buyers. Prefer **cross-cutting product capability** (not new cognition). |
| **Universe & Mandate Operations** | Mostly inside Mandate Authority — OK. |
| **Time** as capability | **Not missing as BC** — Time is environmental structure (ATI-001) + Temporal Context belief (ATI-003). First-class *concept*, not first-class *capability BC*. |
| **Knowledge** as capability | **Not missing as BC** — Knowledge is activated competence content under Competence Evolution + Memory substrate. First-class *content kind*, not separate product capability rivaling Understanding. |
| **Multi-tenant Product Administration** | Outside ATI cognitive product; platform/IAM — out of scope unless ATI productizes tenancy (not required by frozen ATI). |

**Hard missing call:**

> **Research (including Simulation Lab)** is the primary missing **product capability** distinct from live Deliberation.

---

# 5. Merge Candidates

| Merge idea | Verdict |
|---|---|
| Sensing + Evidence | **Reject** — Percept≠Fact is product-critical |
| Experience + Competence Evolution | **Reject** — fuel≠activation |
| Market Intelligence + Agent Ledger | **Reject** — world≠body |
| Decision + Deliberation | **Reject** — ranking≠commit |
| Enactment + Consequence | **Reject** — Execution≠Outcome |
| Mandate + Decision | **Reject** — law≠choice |
| Reference + Sensing | **Reject** — structure≠live sensing |
| Deliberation + Research | **Do not merge** — opposite of need; Research should split *out* |

**No merges recommended** for long-term product clarity.

---

# 6. Split Candidates

| Split | Verdict |
|---|---|
| BC-07 Deliberation → **Live Deliberation** + **Research/Simulation Lab** | **Recommend (product architecture)** |
| BC-09 Enactment → Intent vs Execution | **Reject** — artificial; cognition already separates Intent/Action/Execution inside one capability |
| BC-04 Market Intelligence → many micro-capabilities per M1–M20 | **Reject** — ontology ≠ capabilities |
| BC-12 → Learning vs Governance | **Reject for now** — single “Competence Evolution” capability is the right product story (propose→approve→activate) |

---

# 7. Long-Term Capability Map (20-year)

Permanent product capabilities (recommended):

```
ATI PRODUCT CAPABILITIES
│
├─ A. REFERENCE & SENSE
│   ├─ Environment Reference
│   ├─ Market Sensing
│   └─ Evidence Registry
│
├─ B. UNDERSTAND (CENTER OF GRAVITY — DESCRIPTIVE)
│   ├─ Market Intelligence
│   └─ Agent Ledger
│
├─ C. NORMATIVE ENVELOPE
│   └─ Mandate Authority
│
├─ D. THINK (NON-COMMIT)
│   ├─ Live Deliberation
│   └─ Research & Simulation Lab   ← split/add
│
├─ E. CHOOSE (CENTER OF GRAVITY — NORMATIVE CHOICE)
│   └─ Decision Authority
│
├─ F. AGENCY (OPTIONAL PLANE)
│   ├─ Trade Enactment
│   └─ Consequence
│
└─ G. EVOLVE
    ├─ Experience
    └─ Competence Evolution
```

**Survives if exchanges/brokers/models/assets/deployments change:** All of the above as capability names.  
**Survives if execution optional:** Agency plane dims; Understanding+Decision+Evolve remain.  
**Does not auto-port to non-trading products:** Capability *method* ports; trading names are ATI-specific (aligned with prior DDD-001 scope disclaimer).

---

# 8. Product Architecture Risks

1. **Treating DDD-001 BCs as the product roadmap** without asking which are customer-visible capabilities.  
2. **Deliberation god-capability** absorbing Strategy/Research/Simulation/Signals.  
3. **Enactment-first org** rebuilding an OMS and calling it ATI.  
4. **Presentation mistaken for capability.**  
5. **Opportunity productized as a pillar** → signal shop relapse.  
6. **Strategy as peer capability** → rival constitution to Understanding/Decision/Competence Evolution.  
7. **Ignoring Evidence Registry** → intelligence without truth discipline.  
8. **No Research lab** → live Reasoning overfitted to intraday noise; poor long-horizon learning.  
9. **Center of gravity drift** toward models/vendors instead of Understanding+Decision.  
10. **Stamp/hygiene debt (ARCH-001)** undermining trust in “frozen” product claims.

---

# 9. Final Recommended Product Capability Architecture

## Product identity (freeze candidate for PRODUCT-002 later)

**Autonomous Decision Intelligence over Markets**  
Center of gravity: **Understanding → governed Decision**  
Agency optional. Learning governed. Sensing/Evidence mandatory.

## Permanent capabilities

1. Environment Reference  
2. Market Sensing  
3. Evidence Registry  
4. Market Intelligence (**core**)  
5. Agent Ledger (**core**)  
6. Mandate Authority  
7. Live Deliberation  
8. Research & Simulation Lab (**add/split**)  
9. Decision Authority (**core**)  
10. Trade Enactment (**optional agency**)  
11. Consequence  
12. Experience  
13. Competence Evolution  

## Explicit non-capabilities (product)

- Presentation/UI  
- Signal factory  
- Indicator factory  
- Broker-as-capability  
- Trading OS  
- Strategy-as-peer-pillar  
- Opportunity-as-peer-pillar  
- Time-as-BC  
- Knowledge-as-BC (content kind under Competence Evolution / Memory)

## Mapping note (non-redesign)

DDD-001 BC-01…12 remain valid **semantic owners**.  
PRODUCT-001 recommends **product capability packaging** that mostly 1:1 maps, except:

- **Split product capability** Deliberation → Live Deliberation + Research & Simulation Lab (may still be one or two BCs later — product split first; DDD split only if ownership languages diverge).  
- Strategy/Opportunity/Presentation remain **non-BC product rules**.

This does **not** modify DDD-001 text in this review.

---

# 10. Freeze Recommendation

| Item | Recommendation |
|---|---|
| PRODUCT-001 (this review) | **Do not freeze as constitution** — keep as Architecture Review |
| Product Identity statement | **Advance to PRODUCT-002** for freeze candidate |
| Capability map (13 capabilities with Research split) | **Advance to PRODUCT-002** after board debate on Research split |
| DDD-001 BC list | **No forced change in this review** — optional future DDD amendment only if Research requires separate ownership language |
| Strategy / Opportunity / Presentation as capabilities | **Permanently reject** as peer capabilities |
| Center of gravity = Understanding + Decision | **Approve as product doctrine** |

### Board verdict on current capability architecture

**CONDITIONAL PASS as semantic ownership (DDD-001)**  
**CONDITIONAL FAIL as complete product capability architecture** until Research/Simulation is recognized as distinct from live Deliberation and non-capabilities (Strategy/Opportunity/Presentation/OS) stay killed.

### Score (Product Capability Architecture only)

**7.6 / 10**

Deduction: Deliberation over-aggregation; missing Research lab; identity still easy to misread as Trading OS/OMS; Opportunity/Strategy gravity well.

---

## Direct Answers Index (1–18)

| # | Answer |
|---|---|
| 1 | Autonomous Decision Intelligence over Markets |
| 2 | Decision Intelligence + always-on Understanding; not OS/OMS/signal shop |
| 3 | See §9 map (13 capabilities) |
| 4 | See matrix G rows |
| 5 | Dashboards/cards/heatmaps |
| 6 | Indicators, scores, pattern matches, ephemeral rankings |
| 7 | Presentation, Signal, Broker-as-capability, Strategy-peer, Opportunity-peer, Time-BC, Knowledge-BC |
| 8 | Research & Simulation Lab; Trust/Audit as cross-cutting product surface |
| 9 | Strategy: **not** first-class peer capability; governed competence content only |
| 10 | Time: first-class **concept** in Environment/Understanding; **not** capability BC |
| 11 | Knowledge: first-class **content kind** under Competence Evolution; **not** peer capability |
| 12 | Opportunity: **not** capability; Deliberation judgments only |
| 13 | Presentation: **not** capability |
| 14 | Research should **not** remain only inside live Deliberation |
| 15 | §7 map |
| 16 | Broker adapters, model training stacks, deploy topologies — not capabilities |
| 17 | Understanding+Decision+Evolve survive optional execution; Reference/Sense/Evidence survive venue/broker change |
| 18 | Yes — Understanding (descriptive) + Decision (choice) |

---

## End of PRODUCT-001

**Kill the OS myth. Kill the signal shop. Split Research from live Deliberation. Keep Understanding and Decision at the center. Agency is optional. Learning is governed. This review is not a freeze.**
