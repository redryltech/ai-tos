# DDD-001

# Bounded Context Architecture

**Status:** PROPOSED FOR FREEZE  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI Constitution v1.0 (FROZEN) · DDD-000 Bounded Context Constitutional Foundation (FROZEN)  
**Also conforms to:** ATI-001 … ATI-009  
**Non-scope:** Microservices, databases, APIs, UI modules, implementation, redesign of UAIA/ATI/DDD-000  

**Mission:** Identify ATI’s permanent Bounded Contexts as semantic ownership boundaries around enduring business capabilities.

**Governing formula (DDD-000):**

> Bounded Contexts partition business semantic ownership.  
> UAIA/ATI partition cognitive constitution.  
> These layers must not be collapsed.

---

# 1. Derivation Method

Contexts are derived from enduring ATI **business capabilities**, validated by DDD-000 permanence tests:

1. Semantic stability across tech/venue change  
2. Single steward of meaning  
3. Change cohesion  
4. Independence of truth (no borrowed private models)  
5. ATI Must-Never-Overlap protection  
6. Venue/tech independence  
7. Failure isolation of meaning  

**Rejected derivation methods:** one context per UAIA primitive; one context per ATI document title; team names; deployables.

---

# 2. Complete Set of ATI Bounded Contexts

| ID | Bounded Context | Enduring capability |
|---|---|---|
| BC-01 | Environment Reference | Know what may exist to be traded and under what institutional structure |
| BC-02 | Market Sensing | Sense Trading Environment and situated channels as percepts |
| BC-03 | Evidence Registry | Admit and own accepted evidence (Facts) |
| BC-04 | Market Intelligence | Own present Market Understanding |
| BC-05 | Agent Ledger | Own present Agent Situation |
| BC-06 | Mandate Authority | Own Goals, standing constraint definitions, permission/kill policy meaning |
| BC-07 | Deliberation | Own Reasoning episodes, workspace artifacts, opportunities, alternatives |
| BC-08 | Decision Authority | Own Decision Frame (as bind), Decisions |
| BC-09 | Trade Enactment | Own Intent, Action, Execution |
| BC-10 | Consequence | Own Outcome Streams |
| BC-11 | Experience | Own evaluated Experiences |
| BC-12 | Competence Evolution | Own Learning acts, Candidate Improvements, Governance activation of competence |

**Cross-cutting (not Bounded Contexts):** UAIA Control/Attention as constitutional gating; Memory as substrate referenced by owners of stored content kinds; AI-TOS platform concerns outside ATI BC set.

---

# 3. Context Charters

---

## BC-01 Environment Reference

**Purpose:** Own the authoritative business language for Trading Environment *structure* — what institutions and instruments exist as reference reality.

**Responsibilities:**
- Define venues, instruments, underlyings/linkages, calendars/session templates, regulatory regime reference, clearing/settlement institution reference.
- Publish reference identity language for all other contexts.

**Owned concepts:** Venue · Instrument · Underlying/linkage · Calendar/Session Template · Regulatory Regime (as reference) · Clearing/Settlement Institution (as reference) · Listed Product Universe (as reference set)

**Does NOT own:** Activity traces · Percepts · Facts · Market Understanding beliefs · Orders · Positions · Decisions · Outcomes · Sentiment · Liquidity-as-essence

**Parent UAIA:** Reality (external structure)  
**Parent ATI:** ATI-001  

**Relationships:**
- Publishes language to BC-02, BC-03, BC-04, BC-05, BC-09  
- Conformist consumers use reference IDs; Anti-Corruption if foreign symbology enters  

**Invariants:** Reference meaning survives broker/tech change; does not claim live Activity Field truth.

**Must Never Overlap:** Environment Reference ≠ Market Intelligence ≠ Agent Ledger ≠ Trade Enactment

---

## BC-02 Market Sensing

**Purpose:** Own the language of Observation — channels and percepts across World, Self, Authority, Clock, Channel realms.

**Responsibilities:**
- Define Observation Channels and percept types.
- Emit percepts only; stop before Acceptance Boundary.
- Own Channel-integrity percept language (silence, gap, timeout).

**Owned concepts:** Observation Channel · Percept · Realm tagging (as Observation classification) · Absence/Integrity percept · Sensing Attention aim (as allocation applied to sensing — not Control law)

**Does NOT own:** Facts · Understanding · Indicators · Signals · Opportunities · Decisions · Trend/Regime beliefs

**Parent UAIA:** Observation · Attention (as applied to sensing)  
**Parent ATI:** ATI-002 · ATI-001  

**Relationships:**
- Upstream of BC-03 (percepts → Acceptance)  
- References BC-01 for instrument/venue identity  

**Invariants:** Produces percepts only; no essence smuggling (liquidity/volatility/trend/sentiment/opportunity).

**Must Never Overlap:** Market Sensing ≠ Evidence Registry ≠ Market Intelligence ≠ Deliberation

---

## BC-03 Evidence Registry

**Purpose:** Own the language of accepted evidence — Facts and Acceptance Boundary discipline.

**Responsibilities:**
- Admit/reject/contest/supersede/retract Facts.
- Enforce claim-Fact vs world-state Fact separation.
- Provide provenance and revision lineage of evidence.

**Owned concepts:** Fact · Acceptance Boundary · Integrity status of evidence · Provenance · Fact revision lineage · Claim-event Fact vs world-state Fact

**Does NOT own:** Percepts (pre-acceptance) · Beliefs · Decisions · Outcomes-as-beliefs · Knowledge activation

**Parent UAIA:** Facts · Evidence Integrity (ADR-004 lineage in UAIA)  
**Parent ATI:** ATI-002 (upstream) · Truth Layer via UAIA · supports ATI-003/005 assimilation  

**Relationships:**
- Consumes BC-02 percepts  
- Publishes Facts to BC-04, BC-05, BC-10, BC-11 (as citations)  

**Invariants:** Fact ≠ Truth; Fact ≠ Belief; Reasoning/Decision never mint Facts.

**Must Never Overlap:** Evidence Registry ≠ Market Sensing ≠ Market Intelligence ≠ Deliberation

---

## BC-04 Market Intelligence

**Purpose:** Own the present Market Understanding belief-state language (“I understand today’s market”).

**Responsibilities:**
- Own M1–M20 belief categories and epistemic wrappers for Environment Understanding.
- Assimilate relevant Facts into Market Understanding (Assimilation into this model).
- Publish Understanding revisions for Decision/Deliberation citation.

**Owned concepts:** Market Understanding · M1…M20 · Market Understanding revision identity · Environment-stratum Assimilation into this model

**Does NOT own:** Agent Situation · Opportunities · Predictions-as-Understanding · Signals · Portfolio · Orders · Goals/limit law · Facts themselves

**Parent UAIA:** Understanding (Environment stratum) · Assimilation (as applied here)  
**Parent ATI:** ATI-003  

**Relationships:**
- Consumes BC-03 Facts (World/Clock/Channel-relevant)  
- References BC-01  
- Publishes to BC-07, BC-08  

**Invariants:** Descriptive only; no ought; no agent body; epistemic wrappers mandatory.

**Must Never Overlap:** Market Intelligence ≠ Agent Ledger ≠ Deliberation Opportunity ≠ Decision Authority

---

## BC-05 Agent Ledger

**Purpose:** Own the present Agent Situation belief-state language (“I understand my trading body”).

**Responsibilities:**
- Own S1–S11 and epistemic wrappers.
- Assimilate Self/Channel/Clock/Authority-sensed Facts into body/agency beliefs.
- Publish Agent Situation revisions for Frame/Decision citation.

**Owned concepts:** Agent Situation · S1…S11 · Exposure/concentration as derived views · Agent Situation revision identity · Assimilation into this model

**Does NOT own:** Market Regime/Tradability/Sentiment · Risk limit definitions · Intent/Decision · Opportunity · Execution-as-identity · Portfolio software meaning beyond Situation beliefs

**Parent UAIA:** Understanding (Agent Situation stratum)  
**Parent ATI:** ATI-005  

**Relationships:**
- Consumes BC-03 Facts (Self-primary)  
- References BC-01 for instrument identity on inventory  
- Publishes to BC-06 (utilization readings), BC-07, BC-08, BC-09  

**Invariants:** Action never writes Ledger directly; only Observation→Facts→Assimilation; Execution ≠ Situation.

**Must Never Overlap:** Agent Ledger ≠ Market Intelligence ≠ Mandate Authority (definitions) ≠ Trade Enactment

---

## BC-06 Mandate Authority

**Purpose:** Own normative mandate language — what ATI is for, what limits mean, what permissions/kills mean as policy.

**Responsibilities:**
- Own Goals/objectives/horizons.
- Own standing constraint **definitions** (max loss, max leverage, session restrictions, regulatory mandate rules as policy).
- Own permission/kill/arm **policy meaning** (not every Control mechanism detail).
- Publish mandate language to Decision Frame assembly.

**Owned concepts:** Goals · Mandate · Standing Constraint Definitions · Permission/Kill/Arm Policy · Universe inclusion/exclusion law · Authority-approved mandate amendments

**Does NOT own:** Constraint **utilization** (BC-05 S10) · Decisions · Opportunities · Market Understanding · Facts · Activated trading competence content (BC-12)

**Parent UAIA:** Goals · Control (policy meaning) · Decision Frame inputs  
**Parent ATI:** ATI-004 (Frame inputs) · Authority realm of ATI-002 as sensed inputs via Evidence  

**Relationships:**
- Consumes Authority-related Facts via BC-03  
- Publishes to BC-08 (Frame)  
- References BC-05 utilization as descriptive input (not owned here)  

**Invariants:** Law ≠ consumption; Learning does not auto-activate Goal rewrites.

**Must Never Overlap:** Mandate Authority ≠ Agent Ledger ≠ Decision Authority ≠ Competence Evolution activation without Governance path

---

## BC-07 Deliberation

**Purpose:** Own deliberation language — Reasoning without choice.

**Responsibilities:**
- Own Reasoning Episodes and Reasoning Workspace (internal).
- Own Alternatives, Opportunity Judgments, optional Predictions/Simulations/Scenarios/Counterfactuals/Explanations/Reflections as workspace artifacts.
- Stop before Decision selection.

**Owned concepts:** Reasoning Episode · Reasoning Workspace · Alternative Candidate · Opportunity Judgment · Predictive/Simulative/Explanatory/Reflective artifacts (as deliberation outputs) · Option uncertainty annotations

**Does NOT own:** Decisions · Intents · Facts · Market Understanding beliefs · Agent Situation beliefs · Orders · Signals-as-Decisions · Activated Policies

**Parent UAIA:** Reasoning  
**Parent ATI:** ATI-006 · ATI-006R · ATI-004 (Opportunity placement)  

**Relationships:**
- References BC-04, BC-05, BC-06/BC-08 Frame premises  
- Publishes deliberation products to BC-08  
- Anti-Corruption against treating workspace as Understanding  

**Invariants:** Deliberation ≠ selection; workspace destroyed with episode; never mints Facts; never writes Understanding.

**Must Never Overlap:** Deliberation ≠ Decision Authority ≠ Market Intelligence ≠ Evidence Registry

---

## BC-08 Decision Authority

**Purpose:** Own governed choice language — Decision Frame bind and Decision selection (including Abstain).

**Responsibilities:**
- Own Decision Frame as present normative bind.
- Own Trading Decisions and mandatory citations.
- Authorize Intent creation (handoff to BC-09); do not own Orders.

**Owned concepts:** Decision Frame · Trading Decision · Eligibility (as Frame product) · Decision confidence · Decision lifecycle · Abstain-as-Decision

**Does NOT own:** Opportunity objects (BC-07) · Intent/Action/Execution (BC-09) · Understanding strata · Constraint definitions (BC-06) · Utilization (BC-05) · Orders

**Parent UAIA:** Decision Frame · Decision  
**Parent ATI:** ATI-004  

**Relationships:**
- Assembles Frame from BC-06 + BC-04 + BC-05 readings + Control gates  
- Consumes BC-07 outputs  
- Publishes Decisions to BC-09  

**Invariants:** Selection ≠ enactment; mandatory citations; supersession not silent mutation.

**Must Never Overlap:** Decision Authority ≠ Deliberation ≠ Trade Enactment ≠ Market Intelligence

---

## BC-09 Trade Enactment

**Purpose:** Own enactment language — Intent envelopes, Action attempts, Execution progress.

**Responsibilities:**
- Own Trading Intent (including Inhibit Intent).
- Own Trading Action attempts.
- Own Trading Execution progress reports.
- Enforce one Intent→many Actions; one Action→one Intent.

**Owned concepts:** Trading Intent · Inhibit Intent · Trading Action · Trading Execution · Enactment constraints/success/cancel/expiry on Intent

**Does NOT own:** Decision · Outcome · Experience · Orders-as-constitutional-peer · Understanding writes · Opportunity

**Parent UAIA:** Intent · Action · Execution  
**Parent ATI:** ATI-007  

**Relationships:**
- Consumes BC-08 Decisions  
- Produces Execution progress; couples to Reality → Sensing/Evidence → Ledger/Intelligence  
- Upstream of BC-10  

**Invariants:** Order ≠ Intent ≠ Action; Action↛Understanding direct; Execution ≠ Outcome.

**Must Never Overlap:** Trade Enactment ≠ Consequence ≠ Decision Authority ≠ Agent Ledger

---

## BC-10 Consequence

**Purpose:** Own Outcome Stream language — evidence-bound situational consequences of enactment.

**Responsibilities:**
- Own Outcome elements and Outcome Stream windows.
- Own attribution language to Intent/Action.
- Close windows for Experience candidacy.

**Owned concepts:** Trading Outcome · Outcome Stream · Stream window · Attribution (to enactment) · Completeness/confidence of Outcome records

**Does NOT own:** Execution · Experience · Understanding · Fills-as-Outcomes · Learning

**Parent UAIA:** Outcome / Outcome Stream  
**Parent ATI:** ATI-008  

**Relationships:**
- Concurrent with BC-09 Execution  
- Evidenced via BC-02/BC-03  
- Publishes closed windows to BC-11  

**Invariants:** Stream concurrency; residual after Execution; never direct Understanding write.

**Must Never Overlap:** Consequence ≠ Trade Enactment Execution ≠ Experience ≠ Evidence Registry (Facts owned by BC-03; Outcomes cite Facts)

---

## BC-11 Experience

**Purpose:** Own evaluated episode language — learning fuel quality.

**Responsibilities:**
- Own Trading Experiences, evaluation records, evaluability grades, long horizons, revision lineage.
- Promote from closed Outcome windows only when quality-gated.

**Owned concepts:** Trading Experience · Evaluation record · Evaluability/quality grade · Experience lifecycle · Experience revision lineage

**Does NOT own:** Outcome Stream · Learning proposals · Memory-as-identity · Knowledge activation · Raw Outcomes as Experiences

**Parent UAIA:** Experience  
**Parent ATI:** ATI-009 (Experience half)  

**Relationships:**
- Consumes BC-10 closed windows  
- Publishes qualified Experiences to BC-12  
- Stored *in* Memory substrate without owning Memory-as-BC  

**Invariants:** Evaluated episode; not every Outcome; can exist without Learning; revisable.

**Must Never Overlap:** Experience ≠ Consequence ≠ Competence Evolution ≠ Memory-as-meaning

---

## BC-12 Competence Evolution

**Purpose:** Own improvement proposal and activation language — Learning proposes; Governance activates.

**Responsibilities:**
- Own Learning acts and no-op/reject records.
- Own Candidate Improvements.
- Own Governance approval/rejection/activation/rollback of competence.
- Own meaning of Activated Competence / Knowledge / Policy / Calibration as activated standing content kinds (semantic ownership of those content types’ lifecycle).

**Owned concepts:** Trading Learning act · Candidate Improvement · Governance decision (activation authority) · Activated Competence · Knowledge/Policy/Calibration *as activated competence kinds*

**Does NOT own:** Experiences (BC-11) · live Decision selection · Understanding beliefs · Mandate Goal auto-rewrite · raw Outcome training

**Parent UAIA:** Learning · Candidate Improvement · Governance · Activated Competence · Knowledge/Policy/Calibration  
**Parent ATI:** ATI-009 (Learning half)  

**Relationships:**
- Consumes BC-11 Experiences  
- May reference BC-07 research-like deliberation only as secondary admissible source when gated — never as silent activation  
- Publishes activated competence for retrieval into Deliberation/Mandate/Decision paths without transferring semantic ownership of Decisions  

**Invariants:** Learning never activates; never trains on raw Outcomes; Goals/safety not auto-learned into force.

**Must Never Overlap:** Competence Evolution ≠ Experience ≠ Decision Authority ≠ Mandate Authority (Goal law ownership remains BC-06; competence updates that affect policies must pass Governance without stealing Goal authorship)

---

# 4. Complete ATI Context Map (Conceptual)

```
                    ┌──────────────────────────┐
                    │  BC-01 Environment       │
                    │  Reference               │
                    └────────────┬─────────────┘
                                 │ publishes reference language
                                 ▼
┌──────────────┐         ┌──────────────┐         ┌─────────────────┐
│ BC-02 Market │ percepts│ BC-03 Evidence│ Facts  │ BC-04 Market     │
│ Sensing      ├────────►│ Registry     ├────────►│ Intelligence     │
└──────┬───────┘         └──────┬───────┘         └────────┬────────┘
       │                        │                           │
       │ Self/Channel Facts     │                           │
       │                        ▼                           │
       │                 ┌──────────────┐                   │
       └────────────────►│ BC-05 Agent  │                   │
                         │ Ledger       │                   │
                         └──────┬───────┘                   │
                                │                           │
       ┌────────────────────────┼───────────────────────────┘
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│ BC-06 Mandate│ law     │ BC-08 Decision│◄──── BC-07 Deliberation
│ Authority    ├────────►│ Authority    │      (alternatives,
└──────────────┘         └──────┬───────┘       opportunities)
                                │ Decisions
                                ▼
                         ┌──────────────┐
                         │ BC-09 Trade  │
                         │ Enactment    │
                         └──────┬───────┘
                                │ Execution ∥
                                ▼
                         ┌──────────────┐
                         │ BC-10        │
                         │ Consequence  │
                         └──────┬───────┘
                                │ closed Outcome windows
                                ▼
                         ┌──────────────┐
                         │ BC-11        │
                         │ Experience   │
                         └──────┬───────┘
                                │ qualified Experiences
                                ▼
                         ┌──────────────┐
                         │ BC-12        │
                         │ Competence   │
                         │ Evolution    │
                         └──────────────┘
```

**Translation rule:** All arrows are published language / conformist / anti-corruption exchanges of meaning — not shared god models.

---

# 5. Single-Owner Concept Registry (summary)

| Concept family | Owner |
|---|---|
| Venue/Instrument/Calendar reference | BC-01 |
| Percepts/Channels | BC-02 |
| Facts/Acceptance | BC-03 |
| Market Understanding | BC-04 |
| Agent Situation | BC-05 |
| Goals/Constraint definitions/Permission policy | BC-06 |
| Reasoning/Opportunity/Workspace artifacts | BC-07 |
| Decision Frame/Decision | BC-08 |
| Intent/Action/Execution | BC-09 |
| Outcome Stream | BC-10 |
| Experience | BC-11 |
| Learning/Candidates/Governance activation/Activated Competence kinds | BC-12 |

No dual owners.

---

# 6. Freeze Recommendation

**CONDITIONAL PASS → FREEZE DDD-001** after confirming:

1. BC-06 vs BC-12 boundary on “policy updates” remains Governance-gated without moving Goal authorship out of BC-06.  
2. BC-03 vs BC-10: Outcomes cite Facts; Facts remain BC-03-owned.  
3. No attempt to split BC-09 into Intent-BC / Execution-BC (would overfit cognition 1:1).  

**Reject freeze if** any BC is redefined as a service/DB/UI/team or if Opportunity is moved into BC-04.

---

# 7. Architecture Score

**8.7 / 10**

Strong capability alignment with ATI Must-Never-Overlap. Deduction for Mandate↔Competence policy-update tension (manageable by Governance invariant) and for Assimilation living as *process inside* BC-04/BC-05 rather than its own BC (intentional).

---

# 8. Risks Before Freeze

1. Teams renaming BCs into microservice projects and claiming DDD compliance.  
2. BC-07 becoming a “strategy dump.”  
3. BC-05 becoming “portfolio app” and absorbing Mandate definitions.  
4. BC-12 silently activating without Governance discipline.  
5. Shared Kernel pressure for “Position” owned in both Ledger and Enactment — must remain Ledger-owned belief vs Enactment-owned attempt language with translation.  
6. Treating ATI document titles as BC names without capability tests (avoided here, but drift risk remains).

---

# 9. Freeze Statement

**Document:** DDD-001 Bounded Context Architecture  
**Version:** 1.0  
**Proposed status after board acceptance:** FROZEN  

This document applies DDD-000 to ATI. It introduces no UAIA/ATI cognitive primitives and does not redefine frozen constitutions.

**Conformance sentence:**

> This architecture specializes UAIA v1.0 and ATI Constitution v1.0 under DDD-000; it does not redefine them.

---

## End of DDD-001

**Capabilities own languages. Cognition stays constitutional. One concept, one owner. Translate at the edges.**
