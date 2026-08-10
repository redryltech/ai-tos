# ATI-002

# Trading Observation Architecture

**Status:** PROPOSED FOR FREEZE (Constitutional Review Board draft)  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI-001 Trading Environment Architecture (APPROVED)  
**Specialization rule:** ATI specializes UAIA Observation for the Trading Environment; ATI does not redefine UAIA primitives  
**Document type:** Constitutional architecture — Observation only  

**Single question answered:**

> What can ATI legitimately observe from the Trading Environment — and from ATI’s effector/self/authority/clock/channel interfaces required to inhabit that Environment?

**Hard stop:** Observation ends at **percept emission**, before the Acceptance Boundary.  
No Facts. No Understanding. No signals. No indicators. No predictions. No Decisions. No Intents.

---

# 0. Board Challenge Posture

This board rejects the following temptations:

- “We observe liquidity / volatility / trend / sentiment / risk / opportunity.”
- Equating broker feeds with Reality.
- Treating calculated statistics as percepts.
- Smuggling Market Understanding (future ATI-003) into Observation.
- Adding a sixth Observation Realm that redefines UAIA.
- Treating silence as “nothing happened” rather than a Channel/World percept candidate.

---

# 1. Definition of Trading Observation

**Trading Observation** is ATI’s Attention-aimed sensing of:

1. **Trading Environment phenomena** available through observation channels (ATI-001), and  
2. **Self / Authority / Clock / Channel phenomena** required for a situated trading agent,

producing **percepts** — time-stamped, source-attributed, realm-tagged impressions — and nothing beyond.

**Constitutional sentence:**

> ATI does not observe Truth directly. ATI observes through channels. Trading Observation produces percepts of published activity, statuses, publications, institutional time, agent-body effector reports, authority inputs, and channel integrity — never beliefs, measures-as-ontology, or judgments.

---

# 2. Observation Principles

## OP-01 Channel Mediation
ATI observes **channels**, not bare Reality. Reality is presumed; percepts are channel-delivered.

## OP-02 Percept Ceiling
Observation **ends at percepts**. Acceptance, belief, and judgment are forbidden here.

## OP-03 Realm Discipline
Every percept has **exactly one primary UAIA realm** (World, Self, Authority, Clock, Channel). Secondary tags allowed; dual-primary realm forbidden.

## OP-04 Environment Fidelity
World-realm percepts must map to ATI-001 Environment entities/fields (venues, instruments, activity, information objects, statuses, institutional time publications, etc.) — not to ATI mind-objects.

## OP-05 Manifestation Rule
ATI observes **manifestations**, not metaphysical substances (liquidity-as-essence, volatility-as-essence, sentiment-as-essence).

## OP-06 Absence Is Observable
Missing expected channel content, silence, timeouts, empty books where a book channel exists, missing acks — are observable as percepts (often Channel and/or World status), not “non-events.”

## OP-07 No Inference Laundry
Inferred, estimated, calculated, believed, predicted objects are **not** Observation outputs.

## OP-08 Attention Does Not Create Observables
Attention selects density/targets; it does not invent phenomena.

## OP-09 Broker Is Not Venue
Broker-delivered content may carry venue activity, but broker-as-gateway Self/Channel concerns remain distinct from Venue World objects (ATI-001).

## OP-10 Partial Observability Honesty
Observation must allow incomplete coverage percepts; completeness claims beyond channel scope are illicit.

---

# 3. Observation Realms (UAIA Specialized, Not Redefined)

UAIA’s five realms are **sufficient**. ATI specializes content inside them. No sixth realm.

| Realm | ATI specialization content |
|---|---|
| **World** | Trading Environment: venue activity traces, venue/instrument statuses, official notices, public disclosures, macro releases as publications, media/social claim publications, public regulatory texts, clearing/settlement public statuses, cross-venue public activity |
| **Self** | Agent body/effector reports: inventory reports, cash/margin/capacity reports, working order acks, fill/reject/cancel reports, broker/custodian acknowledgments of ATI’s account state, agency-mode telemetry as sensed |
| **Authority** | Mandate/permission inputs: risk-tolerance updates, arm/disarm, universe include/exclude, halt/override/approve notices from human/institution authority |
| **Clock** | Institutional and civil time signals: session phase publications, calendar landmarks, expiry/settlement clock markers, scheduled event times as clock announcements |
| **Channel** | Integrity of sensing/effector observation paths: gaps, stalls, dupes/out-of-order symptoms, latency degradation, source disagreement flags, silence/timeouts, completeness vs expected coverage |

### Challenge answers (realm sufficiency)

**Q10:** Five realms are sufficient. ATI specializes; it does not extend UAIA with “Market Realm” or “Risk Realm.”  
**Q9:** Every percept has exactly one **primary** realm.  
**Q11:** One percept must not have two primaries. It may carry secondary cross-tags (e.g., World activity with Channel quality hints), but primary ownership is singular.

---

# 4. Observation Channels (First-Class)

## 4.1 Definition

An **Observation Channel** is a durable sensing path through which percepts arrive from a source class into ATI Observation.

Channels are **first-class** in ATI-002 because ATI-001 already established partial observability and broker/venue separation. Without channels as concepts, “we observed the market” falsely implies unmediated Reality access.

## 4.2 Channel ≠ Realm

- **Realm** classifies *what kind of phenomenon* the percept is about.  
- **Channel** classifies *which path delivered it*.

Example: Venue last-trade print → Realm **World**, Channel **Venue Market Data Path**.  
Broker position snapshot → Realm **Self**, Channel **Broker Account Path**.  
Feed heartbeat timeout → Realm **Channel**, Channel **same path’s integrity sense**.

## 4.3 Channel Classes (Constitutional, not vendor lists)

| Channel class | Typical realm outputs |
|---|---|
| Venue market data path | World activity/status |
| Venue reference/listing path | World instrument/venue structure publications |
| Official notice/disclosure path | World information objects |
| Macro/statistical release path | World publications |
| Media/social claim path | World claim publications |
| Broker/custodian account path | Self |
| Order/execution ack path | Self |
| Authority/mandate path | Authority |
| Institutional clock/calendar path | Clock |
| Channel integrity sense (meta-path) | Channel |

**Invariant:** Naming a vendor does not create a new constitutional channel class.

---

# 5. Observation Ontology

```
TRADING OBSERVATION
├─ Attention Aim (from Control; not an observable)
├─ Observation Channels
├─ Percepts
│   ├─ Primary Realm (exactly one)
│   ├─ Channel identity
│   ├─ Payload (raw sensed content)
│   └─ Integrity hints
└─ Emission to Acceptance Boundary
    (STOP — ATI-002 ends here)
```

No “Liquidity Object,” “Volatility Object,” “Trend Object,” “Sentiment Object,” “Opportunity Object” appear in this ontology.

---

# 6. Observable Phenomena

## 6.1 World-realm observables (from ATI-001 Environment)

| Observable class | Examples of *manifestations* (not essences) |
|---|---|
| Activity traces | Trades/prints, published book/quote updates, auction indicators where published, cancellations where published |
| Venue/instrument status | Open/halted/suspended/listed/expired/delisted notices |
| Reference publications | Contract spec publications, corporate action notices as published objects |
| Information objects | Issuer disclosures, regulator notices, macro release publications, news/social claim publications |
| Public post-trade statuses | Clearing/settlement statuses where published |
| Cross-venue public activity | Public prices/states at other venues |

## 6.2 Self-realm observables

Account/inventory/cash/margin/capacity reports; order accepted/rejected/cancelled/replaced reports; fill/partial reports; broker/custodian state snapshots; sensed agency-mode flags.

## 6.3 Authority-realm observables

Mandate texts/updates; arm/disarm; halt/override; universe constraints from authority; approval notices.

## 6.4 Clock-realm observables

Session phase signals; calendar landmarks; expiry/settlement clock markers; scheduled release timestamps as clock announcements.

## 6.5 Channel-realm observables

Silence, timeout, gap, stall, duplicate/out-of-order symptoms, latency blowout flags, completeness shortfalls, source disagreement flags.

---

# 7. Observable vs Inferred  
## (and Measured / Calculated / Estimated / Believed / Predicted)

These are **not synonyms**. ATI-002 admits only **Observed** (and Channel-noted absence).

| Kind | In ATI-002? | Notes |
|---|---|---|
| **Observed** | **Yes** | Channel-delivered percept of a manifestation or absence |
| **Measured** | **No as Observation output** | Measurement devices/channels deliver observations; “measurement” as derived quantity (e.g., computed volatility) is post-Observation |
| **Calculated** | **No** | Indicators, VWAP, realized vol, Greeks — **reject from ATI-002** → later layers / ATI-003+ |
| **Estimated** | **No** | Hidden liquidity estimates, fair value — reject |
| **Inferred** | **No** | Trend, regime, sentiment, institutional motive — reject → Understanding/Reasoning later |
| **Believed** | **No** | Understanding |
| **Predicted** | **No** | Reasoning |

### Challenge answers

| # | Question | Board ruling |
|---|---|---|
| 1 | Observe Reality or channels? | **Channels.** Reality is external; Observation is mediated. |
| 2 | Observe liquidity? | **No essence.** Observe manifestations: book depths/updates, spreads-as-quoted, trade rates, voids/empty books, venue liquidity-status notices. “Liquidity” as force-belief → later. |
| 3 | Observe volatility? | **No essence.** Observe price/trade range manifestations and statuses; volatility metrics are calculated/estimated later. |
| 4 | Observe trend? | **No.** Trend is Understanding (or worse, a signal). |
| 5 | Observe sentiment? | **No.** Observe claim publications and activity traces; sentiment is inferred. |
| 6 | Observe risk? | **No as judgment.** Observe Self exposure reports and World conditions/manifestations; “risk” as Decision/Constraint concept is out of scope. Market fragility beliefs → later Understanding. |
| 7 | Observe opportunity? | **No.** Decision-side judgment. Explicitly rejected from ATI-002; belongs with later Decision/Judgment docs — **not ATI-003 if ATI-003 is Understanding-only either**; opportunity is normative/decision-facing. |
| 13 | Observe absence? | **Yes** — as percepts of missing expected content / silence / timeouts / empty published books. |
| 14 | Observe uncertainty? | **No as mental state.** Observe conflict, gaps, incompleteness hints that later increase Understanding unknowns. |
| 15 | Observe contradictions? | **Observe conflicting percepts** (disagreement). “Contradiction” as belief conflict is Assimilation/Understanding — out of scope. |

---

# 8. Percept Types

| Percept type | Meaning |
|---|---|
| **Activity percept** | World activity trace sample |
| **Status percept** | Venue/instrument/session/operational status sample |
| **Publication percept** | Information object / claim / disclosure / release as published |
| **Reference percept** | Instrument/venue reference publication sample |
| **Self-state percept** | Agent body/effector report sample |
| **Authority percept** | Mandate/permission input sample |
| **Clock percept** | Institutional/civil time landmark sample |
| **Absence / integrity percept** | Silence, gap, timeout, incompleteness, disagreement |

Percept types are classifications of payloads — they do not create new realms.

---

# 9. Observation Properties

Every Trading Observation percept must carry:

| Property | Required |
|---|---|
| Observe-time | Yes |
| Phenomenon-time (as-of) | Yes when knowable |
| Source | Yes |
| Channel identity | Yes |
| Primary realm | Yes (exactly one) |
| Payload | Yes |
| Scope claim | Yes (what coverage this percept pretends to represent) |
| Integrity hints | Yes (latency/gap/completeness/silence as known) |

**Not required on Observation:** confidence-as-belief, indicator values, regime labels, opportunity scores.

---

# 10. Observation Integrity

Integrity in ATI-002 is **sensing honesty**, not Fact acceptance (Acceptance Boundary is downstream).

Integrity concerns expressible as Channel-realm percepts and integrity hints on other percepts:

- silence / timeout  
- gap / stall  
- out-of-order / duplicate symptoms  
- latency degradation  
- incompleteness vs declared scope  
- multi-source disagreement flags  

**Invariant:** Degraded channels still produce Observation (integrity percepts). They must not be mistaken for “calm World.”

---

# 11. Observation Lifecycle

```
Attention aims channels/targets
  → Channel delivers content OR silence
  → Percept formed (realm + channel + payload + times + integrity hints)
  → Percept emitted to Acceptance Boundary
  → ATI-002 ENDS
```

No “interpreted,” “enriched,” “indicator-attached,” or “understood” states inside Observation lifecycle.

---

# 12. Observation Invariants

1. Observation produces percepts only.  
2. Observation does not cross the Acceptance Boundary.  
3. ATI observes via channels, not bare Reality.  
4. Exactly one primary realm per percept.  
5. UAIA’s five realms are not redefined; ATI specializes content only.  
6. Liquidity, volatility, trend, sentiment, risk-as-judgment, opportunity are not observables-as-essences.  
7. Absence/silence/timeouts are observable.  
8. Calculated/estimated/inferred/believed/predicted are not Observation outputs.  
9. Broker gateway ≠ Venue.  
10. Self capital/orders reports are Self percepts, not World Environment objects.  
11. Publications are observable as publications; truth-value is not Observation’s job.  
12. Attention does not mint observables.  
13. Observation integrity failures are first-class Channel percepts.  
14. Anything belonging to Understanding/Decision must be rejected from ATI-002.

---

# 13. Common Architectural Mistakes

1. “We observed that the market is trending.”  
2. “We observed liquidity dried up” without specifying manifestations.  
3. Treating VWAP/RSI/IV as percepts.  
4. Treating opportunity as observable.  
5. Collapsing broker feed with Reality.  
6. Ignoring silence as non-observation.  
7. Dual-primary realms on one percept.  
8. Inventing a Risk Observation Realm.  
9. Putting Acceptance/Fact logic inside Observation.  
10. Letting Observation emit Understanding labels (regime, fragility).  
11. Observing other participants’ private intent.  
12. Equating Authority mandate text with World activity.  
13. Claiming complete Environment observation.  
14. Using Observation to mean “our research dataset build.”  

---

# 14. Rejected Alternatives

| Alternative | Verdict |
|---|---|
| Observe “market state objects” (regime/trend/sentiment) directly | **Reject** → ATI-003+ / Reasoning |
| Sixth realm: Market / Risk / Opportunity | **Reject** — violates UAIA |
| Channels not first-class | **Reject** — hides mediation and integrity |
| Observation includes indicators | **Reject** |
| Observation includes Facts | **Reject** — UAIA violation |
| Only World observation; ignore Self/Channel | **Reject** — breaks situated agent |
| Environment fully observable | **Reject** — ATI-001 contradiction |
| Sentiment as World essence percept | **Reject** |

---

# 15. Final Constitutional Recommendation

**Freeze ATI-002 as:**

> Trading Observation is channel-mediated sensing specialized to ATI-001’s Trading Environment (World) plus Self, Authority, Clock, and Channel realms. It emits realm-singular percepts of manifestations, publications, statuses, institutional time, agent-body reports, authority inputs, and absences/integrity symptoms — and stops before the Acceptance Boundary. It does not observe liquidity/volatility/trend/sentiment/risk/opportunity as essences; those are calculated, inferred, believed, or decided later. UAIA’s five realms remain sufficient.

---

# Constitutional Verdict

| Item | Verdict |
|---|---|
| **Conformance to UAIA** | PASS — Observation specialized, not redefined |
| **Conformance to ATI-001** | PASS — World observables map to Environment; broker/capital boundaries respected |
| **Scope control** | PASS — stops at percepts |
| **Essence smuggling** | PASS if freeze text enforced; residual risk noted below |
| **Ready to freeze?** | **CONDITIONAL PASS** |

## Architecture Score

**8.6 / 10**

Strong on boundaries, realms, channels, observable-vs-inferred discipline.  
Not 10 because language risk remains: practitioners will still say “observe volatility/liquidity” unless operational vocabulary is policed in later docs.

## Remaining Weaknesses (correct before freeze)

1. **Vocabulary enforcement annex (recommended minor addition before freeze):**  
   A one-page “Forbidden Observation Phrases → Legal Percept Phrases” table (e.g., “liquidity dried up” → “empty/thin published book updates / widened quoted spread samples / trade-rate drop samples”). This does not add concepts; it prevents semantic drift.

2. **Cross-venue clock skew:**  
   Phenomenon-time vs observe-time across venues needs an explicit invariant note that Clock percepts do not magically synchronize World as-of times. (Clarification, not new realm.)

3. **Auction/indicative vs continuous traces:**  
   Confirm both are Activity/Status percept subtypes under World — already implied; make explicit in freeze to avoid “auction = Understanding.”

4. **Opportunity rejection pointer:**  
   Explicitly state opportunity is **not ATI-003 Environment Understanding content** either if ATI-003 stays descriptive; it is Decision-facing. Prevents dumping rejected ATI-002 content into ATI-003.

5. **Self vs World dual delivery:**  
   When a broker reprints venue trades, primary realm is still **World** (activity about Environment); Channel is broker path; do not mark as Self. Add as invariant example before freeze.

## Board Decision

**Approve ATI-002 for freeze after applying clarifications (1)–(5) as non-semantic annex/invariant sharpening.**  
Do **not** approve any version that reintroduces trend/sentiment/liquidity-essence/opportunity as observables.

---

## End of ATI-002

**Observe channels. Emit percepts. Stop.  
Manifestations yes. Essences no.  
Calculated no. Inferred no. Believed no. Predicted no.**
