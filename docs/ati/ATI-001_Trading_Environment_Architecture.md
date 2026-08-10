# ATI-001

# Trading Environment Architecture

**Status:** PROPOSED FOR FREEZE  
**Version:** 1.0  
**Parent constitution:** UAIA v1.0 (FROZEN) — ATI specializes UAIA; ATI does not redefine UAIA  
**Platform constraint:** AI-TOS is frozen and out of scope  
**Document type:** Constitutional architecture — environment only  

**Single question answered:**

> What is the environment in which Autonomous Trading Intelligence exists?

**Explicitly out of scope:** Observation, Facts, Assimilation, Understanding, Decision Frame, Reasoning, Decision, Intent, Action, Execution, Outcome, Experience, Learning, Governance, Memory, Control, software, DDD, APIs, implementation.

---

# 0. Challenge Posture

This document does **not** assume common trading vocabulary is architecturally correct.

Rejected weak moves:

- Calling “the market” a single blob.
- Treating ATI’s own capital as environment.
- Treating brokers as purely external scenery or purely internal organs without boundary analysis.
- Treating news as “Understanding.”
- Treating regulation as optional flavor text.
- Hardcoding one country as the environment ontology.
- Modeling other participants’ private intent as environmental fact.

---

# 1. Definition of Trading Environment

**Trading Environment** is the external financial Reality in which ATI is situated: the set of venues, instruments, participants, information publications, institutional clocks, rules, and exogenous events that exist independently of ATI’s beliefs, decisions, or learning.

It is:

- **External** to ATI as agent;
- **Shared** (other agents inhabit it too);
- **Rule-bearing** (venues and regulators constrain what can happen);
- **Time-structured** (sessions, calendars, settlement clocks);
- **Only partially observable.**

It is **not**:

- ATI’s Understanding;
- ATI’s Goals;
- ATI’s own capital, inventory, or orders as agent-body state;
- ATI’s policies, strategies, or Candidate Improvements.

**Constitutional sentence:**

> The Trading Environment is the external, rule-bearing, time-structured financial Reality ATI inhabits — not ATI’s mind, not ATI’s body, and not ATI’s mandate.

---

# 2. Environment Boundaries

## 2.1 Inside the Trading Environment

| Belongs | Why |
|---|---|
| Venues / exchanges / matching facilities | Shared institutions where tradable interaction occurs |
| Clearing & settlement institutions (as external institutions) | Shared post-trade Reality affecting what “done” means in the world |
| Instruments / contracts / listings | External objects with rules of existence and tradability |
| Other participants | External agents (known only by traces, not private minds) |
| Published information & official notices | External information objects that exist in the world |
| Macro / cross-asset / exogenous physical-financial conditions that affect markets | External forces |
| Regulation & venue rules as external constraints | Environmental law-of-the-world, not ATI preference |
| Institutional time (sessions, calendars, expiries) | Environmental clock |
| Market activity traces (prints, books, statuses as world events) | External happenings |

## 2.2 Outside the Trading Environment (Agent / Non-Environment)

| Does NOT belong | Why |
|---|---|
| ATI’s beliefs / Understanding | Mind, not world |
| ATI’s Goals / mandate text as preference | Normative agent constitution |
| ATI’s inventory, cash, margin *as ATI’s body* | Agent Situation (UAIA), not Environment |
| ATI’s working orders *as ATI’s commitments* | Agent body / effector path |
| ATI’s strategies, policies, Candidate Improvements | Agent competence |
| ATI’s Governance approvals | Agent authority process |
| Private mental states of other participants | Not environmental entities; at best inferred later (out of scope here) |

## 2.3 Contested Boundary Objects (Aggressive Rulings)

### Broker

**Ruling: Hybrid — mostly effector gateway, not a core Environment entity.**

- The **venue** is Environment.
- The **broker/custodian as ATI’s access path and account relationship** is part of ATI’s effector/self interface to Environment, not “the market itself.”
- Broker-published public market data, if indistinguishable from venue data, is an **Information Source** channel to Environment — the channel is not the Environment ontology’s center.
- Treating “broker” as synonymous with “market” is an architectural mistake.

### Capital

**Ruling: Split.**

- **ATI’s capital / cash / margin balances** → **not Environment** (agent body).
- **Market-wide capital conditions, liquidity of the crowd, funding stress in the system** → Environment forces / conditions.
- Never model “my buying power” as an environmental entity.

### Instruments

**Ruling: Environment objects.**  
Instruments exist in the world with contract rules whether or not ATI trades them.

### Exchange / Venue

**Ruling: Core Environment institution.**

### Regulation

**Ruling: Environmental force / constraint field.**  
Not ATI policy. ATI policy may *conform* to regulation; regulation itself is external.

### News / Social Media

**Ruling: Information Sources publishing claims into the Environment’s information field.**  
They are environmental *sources of published claims*, not beliefs and not automatically true world-state.  
Social media is not a venue; it is an information source class — often low integrity.

### Time

**Ruling: Environmental structural force.**  
Institutional time is not ATI’s stopwatch preference; sessions and calendars are external.

---

# 3. Environment Ontology (Top Level)

```
TRADING ENVIRONMENT
├─ Institutional Structure
│   ├─ Venues
│   ├─ Clearing & Settlement Institutions
│   └─ Regulatory Regimes
├─ Tradable Objects
│   └─ Instruments (and underlyings / contract linkages)
├─ Participants (external)
├─ Activity Field
│   ├─ Trading activity traces
│   ├─ Venue statuses (halts, auctions, connectivity of the venue itself)
│   └─ Liquidity & microstructure conditions (as world properties)
├─ Information Field
│   ├─ Official disclosures & notices
│   ├─ Macro / economic publications
│   └─ Media & other claim publishers
├─ Temporal Structure
│   ├─ Clocks & calendars
│   ├─ Sessions & auctions
│   └─ Contract time (expiry, roll landmarks)
└─ Exogenous Forces
    ├─ Macro / cross-asset regimes of the world
    ├─ Geopolitical / physical / operational shocks
    └─ Corporate & issuer events
```

---

# 4. Fundamental Environment Entities

Only entities that are **external, persistent-enough, and world-real**:

| Entity | Nature | Mutable? |
|---|---|---|
| **Venue** | Matching/trading institution | Rules/status change; identity persists |
| **Clearing/Settlement Institution** | Post-trade institution | Rules/status change |
| **Regulatory Regime** | Rule authority domain | Rules amend; regime identity persists |
| **Instrument** | Tradable contract/object | Specs corporate-action over time; listing can end |
| **Underlying / Reference** | Linked real-world or financial reference of contracts | Changes |
| **Participant Class** | Category of external agent (dealer, fund, retail crowd, issuer, etc.) | Composition changes; classes persist |
| **Listed Product Universe** | Set of currently listed instruments at venues | Changes continuously |
| **Information Source** | Publisher of claims/notices | Reputation/status changes; source identity persists |
| **Calendar / Session Template** | Institutional time structure | Amendments occur; structure persists |
| **Published Notice / Disclosure Object** | Discrete information object once published | Immutable as historical publication; interpretations are not the object |

**Not fundamental environment entities:** ATI account, ATI strategy, ATI Decision, “alpha,” “signal,” “my PnL.”

---

# 5. Environmental Forces

Forces are **external pressures that shape the Activity Field** without being ATI’s choices.

| Force | Meaning |
|---|---|
| **Venue microstructure force** | How matching, fees, tick rules, auctions shape activity |
| **Liquidity force** | Capacity of the crowd to absorb interaction |
| **Volatility / uncertainty force** | Amplitude and instability of the Activity Field |
| **Regulatory / compliance force** | External constraints on what may be listed, traded, disclosed |
| **Monetary / macro force** | Rates, inflation, policy, FX, credit conditions |
| **Cross-asset coupling force** | Dependence across instruments/venues |
| **Event / shock force** | Discrete exogenous disruptions |
| **Issuer / corporate force** | Actions of issuers affecting instruments |
| **Temporal force** | Session phase, expiry gravity, settlement clocks |
| **Information intensity force** | Rate and conflict of published claims |

**Challenge ruling:** “Sentiment” is **not** a primary environmental force.  
Sentiment is an attribution later systems may infer. Environment holds **publications and activity**, not a mystical mood substance.

---

# 6. Time

Time in the Trading Environment is **institutional and multi-layered**, not a single wall-clock convenience.

| Layer | Environmental meaning |
|---|---|
| **Civil / UTC time** | Shared physical clock reference |
| **Venue calendar** | Holidays, special sessions |
| **Session structure** | Pre-open, continuous, close, post, auction windows |
| **Contract time** | Expiry, exercise windows, roll periods |
| **Settlement time** | T+N and clearing landmarks |
| **Event time** | Scheduled release times; unscheduled shock times |

**Invariants:**

- Time is environmental structure.
- ATI’s attention schedule is not Time.
- “Market closed” is an environmental state of venues/sessions, not an ATI mood.

**What never changes:** the necessity of institutional time structure.  
**What changes:** calendars, session schedules, expiry maps, holiday lists.

---

# 7. Participants

Participants are **external agents** in the Environment.

| Participant class (examples) | Environmental status |
|---|---|
| Liquidity providers / market makers | External |
| Funds / institutions | External |
| Retail crowd | External |
| Issuers | External |
| Regulators / SROs | External (also rule authorities) |
| Clearing members | External |
| ATI itself | **Not an external participant in ontology terms** — ATI is the situated agent |

**Aggressive ruling:**

- Environment includes **other participants as classes and observable traces**, not their private Intent/Decision.
- “Institutional activity” as omniscient fact is **not** an environment entity; it is an inference temptation for later documents.
- ATI must never model “what Jane Street is thinking” as an environmental object.

**Observable vs inferred:**

- Observable: trades, quotes, cancellations, large prints *as public traces*, filings, official flows where published.
- Inferred (not environment ontology): motives, private inventories of others, hidden orders not in public Reality.

---

# 8. Instruments

Instruments are **external tradable objects** with contract identity and rules.

Fundamental instrument aspects (timeless):

| Aspect | Meaning |
|---|---|
| Identity | Symbol/contract identity at a venue |
| Contract specification | Multiplier, tick, currency, delivery/exercise rules |
| Tradability state | Listed, halted, suspended, expired, delisted |
| Linkage | Underlying, deliverable basket, option chain relations |
| Corporate action susceptibility | Dividends, splits, mergers, adjustments |

**Cash equities, futures, options, indices as underlyings** are specializations of Instrument — not separate environment metaphysics.

**Challenge ruling:**

- An index may be a **reference/underlying** without being directly tradable.
- “NIFTY” as a brand is not the ontology; **index reference + derivative contracts** are.
- India-specific listings are **instance data**, not constitutional entities. Constitution stays venue-agnostic; specializations bind instances.

**Immutable vs temporary:**

- Contract economics templates persist as types.
- Particular listed contracts are temporary (they expire/delist).
- Adjusted series after corporate actions are environmental history of the object — careful: adjustments are world facts about the instrument’s history, not ATI beliefs.

---

# 9. Venues

Venues are **core Environment institutions**.

A Venue provides:

- matching / trading facility identity;
- session calendar binding;
- microstructure rules (ticks, lots, auctions);
- instrument listing universe at that venue;
- operational statuses (open, halted, degraded);
- official market data publications as venue truth sources (integrity varies).

**Related but distinct:**

- **Clearing/settlement institutions** — environmental, post-trade.
- **Broker routing** — not a Venue; effector path of the agent.
- **Dark pools / alternative venues** — still Venues (or venue-like facilities) if they are shared matching institutions.

**Invariant:** ATI does not “contain” a Venue. ATI interacts with Venues from outside.

---

# 10. Information Sources

Information Sources are **environmental publishers** of claims and notices.

| Class | Role |
|---|---|
| Venue official data | Activity Field publications |
| Regulator / exchange notices | Official constraint and status publications |
| Issuer disclosures | Corporate information objects |
| Macro statistical agencies | Scheduled economic publications |
| News media | Claim publishers |
| Social / informal networks | Claim publishers (typically weak integrity) |
| Rating / research publishers | Claim publishers |

**Aggressive ruling:**

- An Information Source is **not** a Fact and **not** Truth.
- The Environment contains the **existence of publications**; truth-value is not environment ontology’s job (that is later Evidence Integrity / Facts — out of scope).
- Collapsing “news” into “market state” is forbidden in ATI-001.

---

# 11. External Events

External Events are **world occurrences that alter Environment structure or forces**, whether scheduled or unscheduled.

| Event class | Examples of kind (not implementations) |
|---|---|
| Macro policy events | Rate decisions, liquidity operations |
| Macro data releases | Inflation, employment, growth prints |
| Corporate events | Earnings, guidance, M&A claims/completions, dividends, splits |
| Venue operational events | Halts, outages, special sessions |
| Regulatory events | Rule changes, bans, margin regime shifts |
| Geopolitical / physical shocks | Wars, disasters, infrastructure failures |
| Contract lifecycle events | Expiry, exercise, assignment landmarks |
| Clearing/settlement events | Failures, extensions, extraordinary settlements |

**Ruling:** Rumors are not events-as-truth; a **published rumor claim** is an information object. Completion of a merger is a different environmental occurrence.

---

# 12. Environment Relationships

| Relationship | Meaning |
|---|---|
| Venue **lists** Instrument | Tradability binding |
| Instrument **references** Underlying | Contract linkage |
| Venue **runs on** Calendar/Session Template | Temporal binding |
| Regulatory Regime **constrains** Venue/Instrument/Participant behavior | Rule field |
| Participants **interact through** Venues | Activity generation |
| Activity Field **produces** observable traces | Public footprints |
| Information Sources **publish into** Information Field | Claim injection |
| External Events **shock** Forces / Structure / Activity | Discontinuous change |
| Clearing Institution **finalizes** Venue-resulting obligations | Post-trade Reality |
| Cross-venue Instruments **couple** via underlyings/arbitrage forces | Dependence |

**What changes constantly:** Activity Field, listings, statuses, publications, force intensities.  
**What persists as structure:** the existence of venues, instrument types, calendars, regulatory regimes as institutional categories.

---

# 13. Environment Invariants

1. The Trading Environment is external to ATI.  
2. ATI’s mind is not Environment.  
3. ATI’s capital/inventory/orders-as-self are not Environment.  
4. Venues are Environment; brokers-as-ATI-gateways are not Venues.  
5. Instruments are Environment objects.  
6. Regulation is environmental constraint, not ATI preference.  
7. Institutional time is environmental structure.  
8. Other participants’ private Intent is not an Environment entity.  
9. Publications exist in Environment; their truth-value is not guaranteed by existence.  
10. Environment is only partially observable.  
11. Country/venue instances specialize the ontology; they do not replace it.  
12. Sentiment is not a primitive environmental substance.  
13. Environment continues to exist when ATI is offline.  
14. ATI cannot redefine Environment to include its Goals or Policies.

---

# 14. What ATI Can Observe *(environment-side statement only)*

This section states **what is environmentally available in principle**, not how Observation works.

Environmentally available classes:

- Venue activity traces (trades, books/quotes where published, auction indicators where published);
- Venue and instrument statuses (halt, open, listed, expired);
- Official calendars/session states;
- Official notices and disclosures;
- Macro/public statistical releases;
- Media/social published claims;
- Public regulatory texts and updates;
- Clearing/settlement public statuses where published;
- Cross-asset public prices/states at other venues.

Observability is **permissioned and incomplete** by nature of public vs private Reality.

---

# 15. What ATI Cannot Observe Directly

| Not directly observable | Why |
|---|---|
| Other participants’ private Decisions/Intents | Private agent interiors |
| Hidden liquidity not published | Not in public Activity Field |
| True “fair value” as metaphysical substance | Not an environmental entity |
| Future Events before they occur or are published | Future is not present Environment |
| Exact attribution of every print to a named institution when not disclosed | Trace ≠ identity |
| ATI’s own beliefs | Not Environment |
| Perfect global state across all venues simultaneously | Partial observability / relativity of information |

**Invariant:** What cannot be observed directly must never be smuggled into Environment ontology as if it were an entity.

---

# 16. Common Architectural Mistakes

1. Defining Environment as “whatever the broker API returns.”  
2. Putting ATI capital inside Environment.  
3. Treating broker as the market.  
4. Treating news as market state.  
5. Modeling other agents’ minds as Environment objects.  
6. Hardcoding one nation’s microstructure as universal ontology.  
7. Making “sentiment” a first-class environmental substance.  
8. Confusing settlement institutions away as “just accounting.”  
9. Ignoring institutional time as environmental structure.  
10. Collapsing Information Field into Activity Field.  
11. Treating regulation as optional product preference.  
12. Assuming Environment is fully observable.  
13. Letting Environment ontology include Strategies/Signals/Alpha.  
14. Defining Environment as ATI’s portfolio universe only (narcissistic environment).  

---

# 17. Alternative Architectures Considered

| Alternative | Verdict |
|---|---|
| Environment = Market Data only | **Reject** — omits venues, rules, time, instruments, events |
| Environment = Broker + Account | **Reject** — confuses effector/self with world |
| Environment = “The Market” monolith | **Reject** — non-architecture |
| Environment includes ATI portfolio | **Reject** — violates agent/environment boundary |
| Environment = Instruments only | **Reject** — instruments without venues/time/rules are corpses |
| Environment = Global macro narrative layer | **Reject as center** — narrative is not ontology; macro is a force class |
| **Institutional Environment Ontology (this document)** | **Selected** — venues, instruments, participants, information field, time, forces, events |

---

# 18. Final Recommendation

**Freeze ATI-001 as follows:**

> Autonomous Trading Intelligence exists in a **Trading Environment** defined as the external, partially observable, rule-bearing, time-structured financial Reality composed of venues (and related post-trade institutions), instruments, external participants, activity fields, information sources, institutional time, regulatory regimes, and exogenous events/forces. ATI’s mind, mandate, and financial body are outside this Environment. Brokers-as-gateways are not venues. Publications are environmental objects; truth is not automatic. Private minds of others are not environmental entities. Country and product instances specialize this ontology; they do not redefine it.

**Conformance:**

- ATI-001 specializes UAIA’s notion of external Reality for trading.  
- ATI-001 does not redefine Observation, Understanding, or any UAIA primitive.  
- Later ATI documents must consume this Environment definition; they must not reinvent “the market” as a blob.

**Proposed status after board adoption:** `FROZEN`.

---

## End of ATI-001

**Environment is outside. Agent is inside. Venue is world. Capital-of-self is body. News is publication. Time is institutional. Regulation is force. Others’ thoughts are not objects.**

That is the Trading Environment.
