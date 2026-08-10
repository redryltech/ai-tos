# DDD-002

# Ubiquitous Language

**Status:** FROZEN  
**Version:** 1.0  
**Parents:** UAIA v1.0 (FROZEN) · ATI Constitution v1.0 (FROZEN) · DDD-000 (FROZEN) · DDD-001 (FROZEN)  
**Non-scope:** APIs, databases, services, UI, implementation, redesign of parents, invention of new cognitive concepts  

**Mission:** Define ATI’s official business language rules and ownership — without creating new architecture.

---

# 0. Foundational Answers (Constitutional)

### 1. What is Ubiquitous Language at the constitutional level?

**Ubiquitous Language** is the single, authoritative set of business terms and meanings used inside one Bounded Context — shared by humans and models in that context — such that every term has exactly one definition owned by that context (or by a higher constitution when cross-cutting).

It is a **meaning contract**, not a glossary decoration and not a database schema.

### 2. Why must every business term have exactly one meaning?

Because dual meanings destroy Decision traceability, evidence integrity, and ATI Must-Never-Overlap law.  
If “Position,” “Risk,” “Outcome,” or “Signal” mean two things, the enterprise cannot know which Understanding, Decision, or Experience was meant.

**One term → one authoritative definition → one semantic owner.**

### 3. Can the same word mean different things in different Bounded Contexts?

**Only if treated as different terms across a translation boundary** — never as silent homonyms inside one conversation.

Preferred practice: **different words** for different meanings.  
If the same English word appears in two contexts, it must be **qualified** (e.g., Inventory Belief vs Execution Fill Progress) and mapped by explicit translation — not assumed identical.

### 4. When is translation required?

Whenever a concept crosses a Bounded Context boundary (DDD-001).  
Published Language may be consumed without redefinition; private language must pass Anti-Corruption / translation.

### 5. When should a term be forbidden?

When it:

- collapses a Must-Never-Overlap pair;  
- redefines a UAIA/ATI constitutional term;  
- has no single owner;  
- names implementation (service, table, topic, screen);  
- smuggles strategy/signal/order ontology into cognition layers.

### 6. How should UAIA terminology flow into ATI?

UAIA terms are **supreme**. ATI may specialize their *application to trading* (via ATI-001…009) but may **never redefine** UAIA meanings. ATI documents cite UAIA terms as parents.

### 7. How should ATI terminology flow into DDD?

ATI terms are **authoritative for trading meaning**. DDD-001 assigns **ownership** of those terms to Bounded Contexts. DDD-002 forbids rival definitions. DDD does not invent parallel vocabularies for the same ATI concepts.

### 8. What vocabulary mistakes must be permanently forbidden?

See §5 Forbidden Vocabulary and §9 Must Never Overlap.

---

# 1. Definition

**ATI Ubiquitous Language** is the constitutional vocabulary of Autonomous Trading Intelligence: every official business term has exactly one authoritative definition, exactly one semantic owner (a Bounded Context or a higher constitution for cross-cutting terms), and may cross context boundaries only through explicit Published Language or translation.

---

# 2. Constitutional Principles

**UL-P1 Single Meaning** — One official term has one definition.  

**UL-P2 Single Owner** — Every business term has exactly one semantic owner (DDD-001 BC, or UAIA/ATI for cross-cutting constitutional terms that are referenced-not-redefined).  

**UL-P3 Constitution Supremacy** — UAIA > ATI Constitution/ATI-001…009 > DDD-001 ownership > local speech.  

**UL-P4 No Silent Homonyms** — Same English word in two contexts requires qualification + translation rules.  

**UL-P5 No Synonym Inflation** — Do not invent synonyms for existing UAIA/ATI terms unless absolutely necessary to prevent overlap collisions.  

**UL-P6 Translation at Edges** — Cross-context use requires Published Language consumption or Anti-Corruption translation.  

**UL-P7 Forbidden Collapse** — Terms that collapse Must-Never-Overlap pairs are banned.  

**UL-P8 Capability Language** — Ubiquitous Language names business/cognitive meanings, never deployables.  

**UL-P9 Annex Normativity** — Vocabulary annexes in ATI documents are normative.  

**UL-P10 Freeze Discipline** — New terms that change meaning require board approval and document versioning.

---

# 3. Vocabulary Ownership Rules

## 3.1 Ownership table (authoritative)

| Term / family | Authoritative definition source | Semantic owner (DDD-001) |
|---|---|---|
| Reality / Truth (external) | UAIA | — (not owned as BC content; referenced) |
| Goals | UAIA | BC-06 Mandate Authority |
| Observation / Percept / Observation Channel | UAIA · ATI-002 | BC-02 Market Sensing |
| Fact / Acceptance Boundary | UAIA · ATI-002 lineage | BC-03 Evidence Registry |
| Assimilation | UAIA | Process pattern inside BC-04 / BC-05 (not a term-owner BC) |
| Understanding | UAIA | — (stratum umbrella; not a dump term) |
| Market Understanding (M1–M20) | ATI-003 | BC-04 Market Intelligence |
| Agent Situation (S1–S11) | ATI-005 | BC-05 Agent Ledger |
| Inventory / Cash / Capital Posture / Margin & Capacity / Live Commitments / Settlement / Effector Truth / Agency Mode / Effector Channel Health / Constraint Utilization / Performance State | ATI-005 | BC-05 |
| Decision Frame | UAIA · ATI-004 | BC-08 Decision Authority |
| Reasoning / Reasoning Episode / Reasoning Workspace | UAIA · ATI-006 · ATI-006R | BC-07 Deliberation |
| Alternative Candidate / Opportunity Judgment | ATI-004 · ATI-006 | BC-07 |
| Decision / Abstain (as Decision) | UAIA · ATI-004 | BC-08 |
| Intent / Inhibit Intent | UAIA · ATI-007 | BC-09 Trade Enactment |
| Action | UAIA · ATI-007 | BC-09 |
| Execution | UAIA · ATI-007 | BC-09 |
| Outcome / Outcome Stream / Stream window | UAIA · ATI-008 | BC-10 Consequence |
| Experience | UAIA · ATI-009 | BC-11 Experience |
| Learning | UAIA · ATI-009 | BC-12 Competence Evolution |
| Candidate Improvement | UAIA · ATI-009 | BC-12 |
| Governance (activation authority) | UAIA · ATI-009 | BC-12 |
| Activated Competence | UAIA · ATI-009 | BC-12 |
| Knowledge / Policy / Calibration (as activated competence kinds) | UAIA · ATI-009 | BC-12 |
| Standing Constraint Definitions / Mandate / Permission·Kill·Arm Policy | ATI-004 · ATI-005 boundary | BC-06 |
| Venue / Instrument / Calendar / Session Template / Regulatory Regime (reference) / Clearing·Settlement Institution (reference) | ATI-001 | BC-01 Environment Reference |
| Trading Environment | ATI-001 | BC-01 (structure); live Activity Field sensed via BC-02 |
| Control / Attention | UAIA | Cross-cutting constitutional — referenced widely; redefined nowhere; not a dump BC |
| Memory | UAIA | Substrate — stores content owned by respective BCs; Memory is not a business-term dump |

## 3.2 Rules

1. Only the owner may **define** the term.  
2. Others may **cite** or **translate**, never redefine.  
3. Derived views (e.g., Exposure) remain owned by the owner of their parent model (BC-05).  
4. No second “enterprise glossary” may override this ownership table.

---

# 4. Translation Rules

1. **Crossing a BC boundary requires translation or Published Language consumption.**  
2. **Published Language** from an owner may be used downstream without changing meaning.  
3. **Anti-Corruption** applies when foreign or informal speech enters a context.  
4. **Qualified terms** are mandatory when English words collide (examples below).  
5. **No Shared Kernel by default** (DDD-001). Reference identifiers are Published Language from BC-01.  
6. Translation maps meaning; it does not create a third definition.

### Required qualifications (collision prevention)

| Informal word | Forbidden as bare term | Required official forms |
|---|---|---|
| Position | bare “Position” | **Inventory** (BC-05) vs **Action/Execution progress language** (BC-09) |
| Risk | bare “Risk” | **Fragility** (ATI-003 / BC-04) · **Constraint Definition** (BC-06) · **Constraint Utilization** (BC-05) · **Control kill/arm** (UAIA Control) |
| Policy | bare “Policy” | **Standing Constraint / Mandate Policy** (BC-06) vs **Activated Policy competence kind** (BC-12) |
| Signal | always | Forbidden — use Alternative / Opportunity Judgment / Decision as appropriate |
| Order | as Intent/Action/Decision | Forbidden as constitutional synonym — Order is not Intent, not Action, not Decision |

---

# 5. Forbidden Vocabulary

## 5.1 Permanently forbidden as ATI official business terms

| Forbidden | Why |
|---|---|
| Signal (as Decision/Intent substitute) | Collapses Deliberation/Decision/Enactment |
| Alpha (as Understanding) | Strategy artifact, not belief-state |
| Indicator (as Observation/Understanding) | Calculated artifact, not percept/belief ontology |
| BUY/SELL Decision (as Decision definition) | Order ontology smuggling |
| Order = Intent | ATI-007 forbid |
| Order = Action | ATI-007 forbid |
| Fill = Outcome | ATI-008 forbid |
| Execution = Outcome | ATI-008 forbid |
| Outcome = Experience | ATI-009 forbid |
| Experience = Memory | ATI-009 forbid |
| Experience = Learning | ATI-009 forbid |
| Learning = Activation | UAIA/ATI-009 forbid |
| Opportunity (in Market Understanding) | ATI-003/004 forbid |
| Sentiment (as Environment essence / Understanding peer) | ATI-001/003 forbid |
| Trend/Momentum (as Understanding peers) | ATI-003 derived only |
| Microservice / Topic / Table / Screen (as domain terms) | Implementation leak |
| God “Market State” blob | Violates ATI-003 ontology |
| God “Position” shared across Ledger and Enactment | Dual ownership |

## 5.2 Forbidden synonym invention

Do not rename UAIA/ATI terms (e.g., renaming Understanding to “World Model Service Language,” Decision to “Trade Idea,” Fact to “Event”) for enterprise convenience.

---

# 6. Published Language Rules

1. Each BC may publish a **Published Language** subset of its owned terms for downstream use.  
2. Published Language is **read-only as to meaning** — consumers may not extend definitions.  
3. BC-01 shall publish reference identifiers (Venue, Instrument, Calendar keys) as primary cross-context anchors.  
4. BC-03 shall publish Fact identity/provenance citation forms.  
5. BC-04 / BC-05 shall publish Understanding/Agent Situation **revision citation** forms.  
6. BC-08 shall publish Decision identity/citation forms.  
7. BC-09 shall publish Intent/Action/Execution identity forms.  
8. BC-10 shall publish Outcome Stream window citation forms.  
9. BC-11 shall publish Experience identity/citation forms.  
10. Unpublished private workspace jargon (BC-07) must not leak as enterprise vocabulary without promotion to Published Language.

---

# 7. Cross-Context Language Rules

| Boundary | Language rule |
|---|---|
| BC-02 → BC-03 | Percept language in; Fact language out — never call percepts Facts |
| BC-03 → BC-04/BC-05 | Facts cited; beliefs owned by Intelligence/Ledger |
| BC-04/BC-05 → BC-07 | Understanding revisions cited into Workspace; Workspace artifacts are not Understanding |
| BC-07 → BC-08 | Alternatives/Opportunities in; Decision out — ranking ≠ Decision |
| BC-08 → BC-09 | Decision in; Intent/Action/Execution out |
| BC-09 → BC-10 | Execution progress ≠ Outcome language |
| BC-10 → BC-11 | Closed Outcome window in; Experience out |
| BC-11 → BC-12 | Experience in; Candidate Improvement out — not activation |
| BC-06 ↔ BC-05 | Definitions vs Utilization — never swap terms |
| BC-06 ↔ BC-12 | Mandate law vs Activated competence policy kinds — qualified terms mandatory |
| BC-05 ↔ BC-09 | Inventory belief vs Enactment attempt language — translate; no bare Position |

---

# 8. Invariants

1. Every official business term has exactly one authoritative definition.  
2. Every business term has exactly one semantic owner.  
3. UAIA terms are never redefined by ATI or DDD.  
4. ATI terms are never redefined by DDD ownership assignment.  
5. Cross-context use requires Published Language or translation.  
6. Forbidden vocabulary remains forbidden in official speech and models.  
7. Must-Never-Overlap pairs never share a single collapsed term.  
8. Reasoning Workspace terms are episode-local unless published.  
9. Implementation words are never Ubiquitous Language.  
10. This document invents no new cognitive concepts.

---

# 9. Must Never Overlap (Language form)

| Term A | Term B |
|---|---|
| Percept | Fact |
| Fact | Understanding belief |
| Market Understanding | Agent Situation |
| Opportunity Judgment | Market Understanding |
| Alternative / Opportunity | Decision |
| Decision | Intent |
| Intent | Action |
| Action | Execution |
| Intent/Action | Order (constitutional identity) |
| Execution | Outcome |
| Fill/ack | Outcome |
| Outcome | Experience |
| Experience | Memory (identity) |
| Experience | Learning |
| Learning | Governance activation |
| Constraint Definition | Constraint Utilization |
| Mandate Policy (BC-06) | Activated Policy kind (BC-12) |
| Inventory (BC-05) | Execution progress (BC-09) |

---

# 10. Freeze Recommendation

**Status: FROZEN**

DDD-002 is the constitutional language law for ATI under DDD-001 ownership.

**Conformance sentence:**

> This work uses ATI Ubiquitous Language under DDD-002; it does not redefine UAIA, ATI, DDD-000, or DDD-001.

Breaking changes require DDD-002 major version and board approval.

---

## End of DDD-002

**One term. One meaning. One owner. Translate at the edge. Never collapse the constitution.**
