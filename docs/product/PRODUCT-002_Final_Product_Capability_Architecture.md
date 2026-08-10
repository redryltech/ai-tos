# PRODUCT-002

# Final Product Capability Architecture

**Document:** PRODUCT-002_Final_Product_Capability_Architecture  
**Version:** 1.0  
**Status:** FROZEN  
**Parents:** UAIA v1.0 · ATI Constitution · DDD-000…DDD-010 · PRODUCT-001 (Architecture Review)  
**Authority:** This document freezes ATI’s permanent Product Capability Architecture. No future product document may redefine it. Breaking changes require **PRODUCT v2.0**.  

**Rules of construction:**

- Accepts only approved conclusions from PRODUCT-001.  
- Does not redesign UAIA, ATI cognition, or DDD mechanics.  
- No software, APIs, infrastructure, databases, or implementation.  

---

# 1. Product Identity

**ATI is Autonomous Decision Intelligence over Markets.**

ATI is not:

- a trading bot;  
- a signal factory;  
- an indicator platform;  
- a broker or OMS as product identity;  
- a Trading Operating System;  
- ChatGPT-for-trading.

ATI continuously maintains market and agent understanding and forms governed decisions. Enactment is optional agency, not the definition of the product.

---

# 2. Product Mission

Provide institutional users with:

1. Always-current **Market Understanding** and **Agent Situation**;  
2. **Governed Decisions** (including Abstain) under Mandate Authority;  
3. Optional **Trade Enactment** and **Consequence** tracking;  
4. **Experience**-based, **Governance**-activated improvement of competence;

such that opening the product reveals ATI’s present understanding and decision posture — not a blank “analyze” prompt.

---

# 3. Product Scope

## In scope (permanent)

- Environment reference and sensing  
- Evidence discipline  
- Market Intelligence and Agent Ledger  
- Mandate Authority  
- Live Deliberation and Research & Simulation Lab  
- Decision Authority  
- Optional agency: Trade Enactment and Consequence  
- Experience and Competence Evolution  

## Out of scope (permanent non-identity)

- Presentation/UI as a product capability  
- Signal / indicator factories as capabilities  
- Broker-as-capability  
- Strategy as a peer product capability  
- Opportunity as a peer product capability  
- Redefinition of UAIA or ATI cognition  
- Platform/infrastructure identity (AI-TOS remains platform)

---

# 4. Architectural Center of Gravity

**Center of gravity:**

> **Present Understanding (Market Intelligence + Agent Ledger) → governed Decision Authority.**

Descriptive truth of world and self is primary product substance.  
Normative choice under Mandate is the primary product act.  
All other capabilities exist to feed, protect, enact, or evolve that center.

---

# 5. Permanent Product Capabilities

Semantic ownership of underlying concepts remains with DDD-001 Bounded Contexts unless noted. Product capabilities package long-term business ownership for the ATI product.

---

## PC-01 Environment Reference

**Purpose:** Own institutional reference reality — what venues, instruments, calendars, and regimes exist to be traded.  

**Ownership:** Aligns to BC-01 Environment Reference.  

**Responsibilities:** Maintain reference language for venues, instruments, underlyings/linkages, calendars/session templates, regulatory and clearing/settlement reference identities.  

**Must never own:** Live activity truth · Understanding beliefs · Decisions · Orders · Outcomes · Sentiment.

---

## PC-02 Market Sensing

**Purpose:** Own sensing of the Trading Environment and situated channels as percepts.  

**Ownership:** Aligns to BC-02 Market Sensing.  

**Responsibilities:** Own Observation Channels and percepts across World, Self, Authority, Clock, Channel; stop at percept emission.  

**Must never own:** Facts · Understanding · Indicators · Signals · Opportunities · Decisions.

---

## PC-03 Evidence Registry

**Purpose:** Own admission of accepted evidence.  

**Ownership:** Aligns to BC-03 Evidence Registry.  

**Responsibilities:** Own Facts, Acceptance Boundary discipline, claim-Fact vs world-state Fact separation, provenance and revision lineage of evidence.  

**Must never own:** Percepts as Facts · Beliefs · Decisions · Learning activation.

---

## PC-04 Market Intelligence

**Purpose:** Own present Market Understanding — “I understand today’s market.”  

**Ownership:** Aligns to BC-04 Market Intelligence.  

**Responsibilities:** Own Environment Understanding (ATI-003 M1–M20), epistemic wrappers, revision identity; assimilate relevant Facts into Market Understanding.  

**Must never own:** Agent Situation · Opportunities · Predictions-as-Understanding · Portfolio body · Mandate law · Orders.

---

## PC-05 Agent Ledger

**Purpose:** Own present Agent Situation — “I understand my trading body.”  

**Ownership:** Aligns to BC-05 Agent Ledger.  

**Responsibilities:** Own Agent Situation (ATI-005 S1–S11), derived exposure views, revision identity; assimilate Self-relevant Facts.  

**Must never own:** Market Regime/Tradability as Environment beliefs · Constraint definitions · Intent/Decision · Opportunity · Execution-as-identity.

---

## PC-06 Mandate Authority

**Purpose:** Own normative mandate — goals, standing constraint definitions, permission/kill/arm policy meaning.  

**Ownership:** Aligns to BC-06 Mandate Authority.  

**Responsibilities:** Own Goals, mandate, standing constraint **definitions**, universe inclusion/exclusion law, permission/kill/arm policy meaning; publish mandate language for Decision Frame.  

**Must never own:** Constraint **utilization** · Decisions · Market Understanding · Activated competence authorship of Goals · Opportunities.

---

## PC-07 Live Deliberation

**Purpose:** Own live, Attention-bounded deliberation without commitment.  

**Ownership:** Aligns to BC-07 Deliberation (live portion).  

**Responsibilities:** Own Reasoning Episodes and Reasoning Workspace for live decision support; Alternatives; Opportunity Judgments; optional live prediction/simulation/explanation/reflection artifacts; stop before Decision selection.  

**Must never own:** Decisions · Intents · Facts · Understanding beliefs · Strategy landfill · Long-horizon research programs as its sole home · Orders · Signals-as-Decisions.

---

## PC-08 Research & Simulation Lab

**Purpose:** Own offline and long-horizon research, experimentation, and simulation programs distinct from live deliberation.  

**Ownership:** Product capability split approved by PRODUCT-001; semantic stewardship remains under Deliberation-family ownership until/unless a future PRODUCT v2.0 / DDD amendment assigns a separate BC. Does not redefine UAIA Reasoning.  

**Responsibilities:** Own research theses, structured experiments, stress/simulation campaigns, counterfactual programs that must not pollute live Decision loops; feed Experience/Competence Evolution through lawful gates.  

**Must never own:** Live Decision selection · Production Intent/Action · Understanding belief authority · Silent production activation · Signal factory identity.

---

## PC-09 Decision Authority

**Purpose:** Own governed choice — Decision Frame bind and Decision selection including Abstain.  

**Ownership:** Aligns to BC-08 Decision Authority.  

**Responsibilities:** Own Decision Frame, Trading Decisions, eligibility as Frame product, Decision confidence, lifecycle, mandatory citations; authorize Intent handoff.  

**Must never own:** Opportunity objects · Intent/Action/Execution · Understanding strata · Constraint definitions · Utilization · Orders.

---

## PC-10 Trade Enactment

**Purpose:** Own optional agency enactment — Intent envelopes, Action attempts, Execution progress.  

**Ownership:** Aligns to BC-09 Trade Enactment.  

**Responsibilities:** Own Trading Intent (including Inhibit Intent), Trading Action, Trading Execution; enforce Intent/Action cardinalities.  

**Must never own:** Decision · Outcome · Experience · Order-as-constitutional-identity · Understanding direct writes · Product identity.

---

## PC-11 Consequence

**Purpose:** Own Outcome Streams — evidence-bound situational consequences of enactment.  

**Ownership:** Aligns to BC-10 Consequence.  

**Responsibilities:** Own Outcome elements and stream windows; attribution to Intent/Action; close windows for Experience candidacy.  

**Must never own:** Execution · Experience · Understanding · Fills-as-Outcomes · Learning.

---

## PC-12 Experience

**Purpose:** Own evaluated episodes as learning fuel.  

**Ownership:** Aligns to BC-11 Experience.  

**Responsibilities:** Own Trading Experiences, evaluation records, evaluability grades, long horizons, revision lineage; promote only from closed Outcome windows when quality-gated.  

**Must never own:** Outcome Stream · Learning proposals · Memory-as-identity · Knowledge activation · Raw Outcomes as Experiences.

---

## PC-13 Competence Evolution

**Purpose:** Own governed improvement — Learning proposes; Governance activates.  

**Ownership:** Aligns to BC-12 Competence Evolution.  

**Responsibilities:** Own Learning acts, Candidate Improvements, Governance activation/rejection/rollback, Activated Competence content kinds (Knowledge/Policy/Calibration as activated kinds).  

**Must never own:** Experiences · Decision selection · Understanding beliefs · Mandate Goal authorship · Training on raw Outcomes · Silent production self-modification.

---

# 6. Capability Relationships

```
PC-01 Environment Reference
        │
        ▼
PC-02 Market Sensing ──► PC-03 Evidence Registry
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     PC-04 Market Intelligence        PC-05 Agent Ledger
              │                               │
              └───────────┬───────────────────┘
                          │
                          ▼
                 PC-06 Mandate Authority
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
 PC-07 Live        PC-08 Research   (premises)
 Deliberation      & Simulation Lab
          │
          ▼
 PC-09 Decision Authority
          │
          ▼
 PC-10 Trade Enactment  ∥  PC-11 Consequence
                          │
                          ▼
                   PC-12 Experience
                          │
                          ▼
            PC-13 Competence Evolution
```

**Laws of relationship:**

- Live Deliberation and Research & Simulation Lab both consume Understanding/Mandate premises; only Decision Authority commits.  
- Research does not bypass Decision Authority or Governance.  
- Enactment and Consequence activate only when agency is enabled.  
- Experience feeds Competence Evolution; Competence Evolution never writes Understanding or Decisions directly.

---

# 7. Optional Capability Planes

These are **optional extensions**, not product identity.

| Plane | Status | Rule |
|---|---|---|
| **Agency** | Optional | Includes Trade Enactment + Consequence when enabled |
| **Execution** | Optional mode within Agency | Never defines product identity |
| **Paper / Live** | Optional agency modes | Agency Mode is Agent Ledger belief; Mandate/Control gate permission |
| **Multi-tenancy** | Optional product packaging | Must not redefine capabilities; tenancy is packaging, not identity |
| **Deployment** | Non-capability | Infrastructure; out of product constitution |
| **Human-in-the-loop** | Optional control posture | Mandate/Governance/Control participation; does not replace Decision Authority ontology |
| **Presentation** | Non-capability | Surfaces Read Models; never a permanent product capability |

---

# 8. Product Invariants

1. **Decision Intelligence is the product**; always-on Understanding is its descriptive core.  
2. **Agency is optional**; lack of live execution does not void ATI identity.  
3. **Execution never defines product identity.**  
4. Product capabilities **never redefine UAIA or ATI.**  
5. Product capabilities **never redefine DDD mechanics**; they package business capability ownership.  
6. **One semantic owner per capability** (aligned to DDD single-owner law).  
7. **Strategy is not a peer capability**; it may exist only as governed competence content.  
8. **Opportunity is not a peer capability**; it exists only as Deliberation judgments.  
9. **Presentation is not a capability.**  
10. **Signals and indicators are not capabilities.**  
11. **Learning never self-activates production competence.**  
12. **Center of gravity remains Understanding → Decision.**  
13. Research & Simulation Lab must not pollute live Decision loops.  
14. Breaking these invariants requires **PRODUCT v2.0**.

---

# 9. Capability Ownership Matrix

| Product Capability | DDD-001 semantic owner alignment | Primary ATI parents |
|---|---|---|
| PC-01 Environment Reference | BC-01 | ATI-001 |
| PC-02 Market Sensing | BC-02 | ATI-002 |
| PC-03 Evidence Registry | BC-03 | UAIA Facts · ATI-002 |
| PC-04 Market Intelligence | BC-04 | ATI-003 |
| PC-05 Agent Ledger | BC-05 | ATI-005 |
| PC-06 Mandate Authority | BC-06 | ATI-004 Frame inputs |
| PC-07 Live Deliberation | BC-07 (live) | ATI-006 · ATI-006R |
| PC-08 Research & Simulation Lab | Deliberation-family (product split; BC split deferred) | ATI-006 modes · ATI-009 gates |
| PC-09 Decision Authority | BC-08 | ATI-004 |
| PC-10 Trade Enactment | BC-09 | ATI-007 |
| PC-11 Consequence | BC-10 | ATI-008 |
| PC-12 Experience | BC-11 | ATI-009 |
| PC-13 Competence Evolution | BC-12 | ATI-009 |

---

# 10. Long-term Evolution Rules

1. New venues, brokers, asset classes, and models extend **instances and adapters**, not capability identity.  
2. Optional Agency may be enabled/disabled per offering without renaming the product.  
3. New Read Models/Presentation surfaces may appear without creating capabilities.  
4. New research methods extend PC-08; they do not create Signal capabilities.  
5. Strategy content enters only through Competence Evolution governance — never as a new peer capability.  
6. If Research requires a separate Bounded Context language, that is a future DDD/PRODUCT v2.0 matter — not silent drift.  
7. Multi-product ports (non-trading) require new product constitutions under UAIA; they do not reuse ATI capability names as universal law.  
8. No PRODUCT-00x document may redefine PRODUCT-002 without **PRODUCT v2.0**.

---

# 11. Product Constitution

**We freeze:**

1. Product identity = Autonomous Decision Intelligence over Markets.  
2. Center of gravity = Understanding → Decision.  
3. Permanent capabilities = PC-01 … PC-13 as defined herein.  
4. Agency/Execution/Presentation/Strategy/Opportunity-as-peer = non-identity / non-capability rules herein.  
5. Supremacy: UAIA > ATI Constitution/ATI docs > DDD laws > PRODUCT-002 packaging.  

**PRODUCT-002 does not:**

- alter UAIA primitives;  
- alter ATI cognitive definitions;  
- alter DDD-000…010 mechanics;  
- invent software topology.

---

# 12. Final Freeze Recommendation

**Status: FROZEN**

PRODUCT-002 is the final Product Capability Architecture for ATI v1.

**Conformance sentence for all future product work:**

> This work conforms to PRODUCT-002 Final Product Capability Architecture under UAIA, ATI Constitution, and DDD-000…010; it does not redefine them. Breaking changes require PRODUCT v2.0.

---

## End of PRODUCT-002

**Understand. Decide under mandate. Enact only if agency is on. Experience. Propose. Govern activation. Never become an OMS myth or a signal shop.**
