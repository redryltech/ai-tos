# F-006

# AI-TOS Security and Identity Realization

**Document:** F-006_AI-TOS_Security_and_Identity_Realization  
**Version:** 0.1  
**Status:** Implementation Architecture — NOT FROZEN  
**Parents:** F-005 · F-004 · F-003 · F-002 · F-001 · E-001…E-010 · AI-TOS-000 · Platform Architecture v1.0 (SA-000…SA-015, FROZEN) · UAIA v1.0 · ATI Constitution · DDD Constitution · PRODUCT Constitution  
**Authority role:** Concrete **logical** realization of **S-01 Identity & Access** (SA-013) and **S-02 Security & Secrets** (SA-009) — without selecting technologies, protocols, vendors, or deployment topology. Does not redesign F-003…F-005.  

**Rules of construction:**

- SA-013 owns Identity & Access (**S-01**: M-03, M-04).  
- SA-009 owns Security & Secrets (**S-02**: M-05, M-06).  
- Security ≠ Identity · Identity ≠ Access · Authentication ≠ authorization.  
- Access denial ≠ Business Decision · Security failure ≠ Business Policy · Secrets ≠ Configuration.  
- No IdP, IAM product, OAuth/OIDC implementation, cloud IAM, secret manager, certificate system, or security vendor selected here.  
- No code. No Universal Security Controller, Universal Identity Controller, or Platform Security Brain.  

**Preserved seams:**

> Platform ≠ ATI Product · Access ≠ Business Decision · Security ≠ Business Policy · Secrets ≠ Configuration · Audit ≠ Security · Observability ≠ Security · Integration ≠ Security ownership  

---

# 1. Definition

**Security and Identity Realization** defines how Platform principals are established, how authorized-operation determination is performed, how protective constraints and secrets are applied, and how failures/denials remain engineering outcomes — realizing E-009 and F-003/F-004 boundaries **A-02**, **A-03**, and related flows.

```
Principal
  → Identity (M-03 / S-01)
  → Access determination (M-04 / S-01)
  → Interaction / Execution (S-03 / S-05)
Security (M-05 / S-02) constrains/protects
Secrets (M-06 / S-02) support protection
```

S-01 **determines** authorized operation.  
S-02 **provides** protective constraints/enforcement.  
Neither owns ATI product meaning or Business Decisions.

---

# 2. Identity & Access Realization

## 2.1 Identity boundary (M-03 / S-01)

| Aspect | Realization |
|---|---|
| **Responsibility** | Establish/represent the **principal** for Platform purposes |
| **Owning SA** | SA-013 |
| **Service/module** | S-01 / M-03 |
| **Representation** | R-04 (identity portion) per F-005 |
| **May** | Represent human, service, or system principals as Platform identities |
| **Must not** | Own Business Decisions; become Universal Identity Controller; absorb ATI Strategy/Intelligence meaning |

## 2.2 Access boundary (M-04 / S-01)

| Aspect | Realization |
|---|---|
| **Responsibility** | Perform **authorized-operation determination** for Platform operations |
| **Owning SA** | SA-013 |
| **Service/module** | S-01 / M-04 |
| **API** | **A-02** Access Determination API (F-004) |
| **May** | Permit or deny Platform operations; affect S-03/S-05 admission |
| **Must not** | Become Business Decision; own Opportunity/Strategy; merge into SA-009 ownership |

## 2.3 Principal lifecycle (logical)

```
Unknown / unauthenticated subject
  → Authenticate within protective envelope (see §4)
  → Principal established (M-03)
  → Access determinations over lifetime (M-04)
  → Revoke / expire / rotate principal binding
  → End of principal validity
```

| Stage | Responsibility | Component | Failure boundary |
|---|---|---|---|
| Establish | Create/bind principal representation | M-03 | Authn failure ≠ Business Decision |
| Use | Supply principal to access determination | M-03 → M-04 | Misbinding ≠ Decision |
| Revoke/expire | Invalidate principal or bindings | M-03 (+ S-02 as protective support) | Expiry ≠ Business Decision |
| Audit/observe | Evidence of identity events as justified | S-09 / S-07 | Telemetry/audit ≠ Security ownership |

---

# 3. Security & Secrets Realization

## 3.1 Security boundary (M-05 / S-02)

| Aspect | Realization |
|---|---|
| **Responsibility** | Provide **protective envelope** and **enforcement constraints** for operations/material |
| **Owning SA** | SA-009 |
| **Service/module** | S-02 / M-05 |
| **API** | **A-03** Protective Constraint API (F-004) |
| **May** | Constrain/protect S-01, S-03, S-05, S-06, and other justified targets |
| **Must not** | Own Business Policy; become Universal Security Controller; seize Access ownership from S-01 |

## 3.2 Secrets boundary (M-06 / S-02)

| Aspect | Realization |
|---|---|
| **Responsibility** | Handle **sensitive material** supporting protective mechanisms |
| **Owning SA** | SA-009 |
| **Service/module** | S-02 / M-06 |
| **Representation** | **R-05** (F-005) — **not** R-03 Configuration |
| **May** | Create/rotate/revoke secrets under protective controls |
| **Must not** | Become Configuration (M-02); expose secrets as ordinary parameters |

## 3.3 Component/service dependencies

```
S-02 (protect) ──supports──► S-01 (identity/access)
S-01 / S-02 ──constrain──► S-03, S-05, S-06, S-04, S-10, others as justified
M-02 (config) ──parameters only──► (never absorbs M-06)
S-07 / S-09 ──witness──► security/identity activity (≠ own Security)
S-10 ──connects──► without owning Security
```

---

# 4. Authentication / Authorization Boundary

## 4.1 Separation (E-009 / F-004 seam preserved)

| Term | Owner | Meaning |
|---|---|---|
| **Authentication** (reference) | Occurs within **S-02 protective envelope**; results in **M-03 principal** establishment | Proving/establishing who/what the principal is — **no protocol chosen** |
| **Authorization / authorized-operation determination** | **S-01 / M-04** | Whether a Platform operation is permitted |
| **Protective constraint / enforcement** | **S-02 / M-05** | How operations/material are protected |
| Ambiguous “authorization” | **Not a shared third owner** | Prefer M-04 determination vs M-05 protective constraint |

## 4.2 Laws

1. Authentication ≠ authorization.  
2. Establishing a principal does not grant all operations.  
3. Access determination does not rewrite Business Policy meaning.  
4. Protective enforcement does not replace Access determination ownership.  
5. No technology (OAuth/OIDC/mTLS/etc.) is selected in F-006.

---

# 5. Protection Flows

Flow template fields: Actor/principal → responsibility → component/service → decision or constraint → protected interaction → failure boundary.

## 5.1 Access-determination flow (primary)

| Step | Actor/principal | Responsibility | Component/service | Decision or constraint | Protected interaction | Failure boundary |
|---|---|---|---|---|---|---|
| 1 | External / ATI / internal caller | Present as subject | Caller | — | Toward A-01 / internal call | — |
| 2 | Subject | Authenticate within envelope | S-02 → M-03 | Principal established or not | Protective envelope | Authentication failure ≠ Business Decision |
| 3 | Principal | Request operation | Via S-03 or direct justified caller | — | A-01 / A-04 path | Interaction anomaly ≠ Decision |
| 4 | Principal | Access determination | **S-01 / M-04 (A-02)** | **Permit or deny** Platform operation | Gate before S-05 | **Access denial ≠ Business Decision** |
| 5 | Permitted principal | Enact behavior | S-05 | Engineering result | A-04 | Execution failure ≠ Decision |
| 6 | System | Optional occurrence | S-04 E-03 | Occurrence ≠ Decision | To S-07/S-09 | Occurrence failure ≠ Outcome |

## 5.2 Protective-constraint flow

| Step | Actor/principal | Responsibility | Component/service | Decision or constraint | Protected interaction | Failure boundary |
|---|---|---|---|---|---|---|
| 1 | Any Platform operation path | Request protection application | Caller | — | Toward A-03 / implicit enforcement | — |
| 2 | S-02 | Apply protective constraints | **M-05** | Enforce/constrain | Around S-01/S-03/S-05/S-06/etc. | Security failure ≠ Business Policy |
| 3 | S-02 | Use secrets as needed | **M-06** | Sensitive material use | Supports M-05 | Secret failure ≠ Configuration ownership |
| 4 | Protected path | Continue or halt | Downstream service | Engineering halt vs continue | A-01/A-04/A-05… | Halt ≠ Business Decision |
| 5 | System | Optional security occurrence | S-04 E-07 | Occurrence | S-07/S-09 | ≠ Policy rewrite |

## 5.3 Read/write protection (representations)

| Action | Access (S-01) | Protection (S-02) | Persistence note (F-005) |
|---|---|---|---|
| Read R-02/R-04/… | Authorized-operation determination | Protective envelope | S-06 mechanism ≠ semantic owner |
| Write R-02/… | Authorized-operation determination | Protective envelope | Same |
| Read/write R-05 | Highly constrained; S-02-centric | Secrets under SA-009 | Never as R-03 |
| Read/write R-03 | Config authorities | Protect config channel; secrets excluded | M-02 ownership |

Unauthorized read/write = Access/Security anomaly — not semantic ownership transfer.

---

# 6. Secret/Credential Lifecycle

Logical principles only (no vendor/protocol):

```
Create → Store (R-05 under S-02) → Distribute least-privilege
  → Use in protective operations → Rotate → Revoke/Expire → Destroy
```

| Principle | Rule |
|---|---|
| Ownership | Secrets/credentials remain **SA-009 / S-02** |
| Separation | Secrets ≠ Configuration (M-02 / R-03) |
| Least privilege | Consumers receive minimum necessary material/access |
| Rotation/expiry | Engineering hygiene; **credential expiry ≠ Business Decision** |
| Revocation | Immediate protective effect; not Policy rewrite |
| Audit/observe | May emit evidence to S-09/S-07 without transferring Security ownership |
| Replaceability | Secret mechanism replaceable in later F without constitutional redesign |

---

# 7. Service Protection

## 7.1 Service-to-service protection principles

1. Service callers are principals (or act under principals) subject to **A-02**.  
2. Service paths are subject to **A-03** protective constraints.  
3. Trust between services is engineering trust — not ATI product ownership.  
4. S-10 Integration may connect protected paths but does **not** own Security.  
5. No mesh “security brain” that orchestrates all business meaning.  
6. Internal module calls (M-03↔M-04, M-05↔M-06) remain local; still under S-01/S-02 ownership.

## 7.2 Protected targets (minimum)

| Target | Protected by | Access-gated by |
|---|---|---|
| S-03 (A-01) | S-02 | S-01 |
| S-05 (A-04) | S-02 | S-01 |
| S-06 (A-05) | S-02 | S-01 |
| S-08, S-07, S-09, S-04, S-10 | S-02 as justified | S-01 as justified |

---

# 8. Failure & Denial

| Failure / denial | Contained as | Must not become |
|---|---|---|
| Authentication failure | Identity/security anomaly | Business Decision |
| Access denial | Access outcome (M-04) | Business Decision |
| Security failure | Protective anomaly | Business Policy rewrite |
| Secret failure | Secrets anomaly | Configuration ownership |
| Credential expiry | Protective/identity lifecycle event | Business Decision |
| Unauthorized access attempt | Access/Security anomaly | Semantic ownership transfer |
| Protective halt of operation | Engineering constraint | ATI Strategy/Opportunity determination |
| Observability/Audit loss of security evidence | Evidence anomaly | Missing Truth / Security ownership seizure by S-07/S-09 |

---

# 9. Replaceability

Identity providers, secret managers, certificate systems, IAM products, and protocols may be selected in **later** F documents if:

1. SA-013 / SA-009 ownership remains unmerged;  
2. Authentication ≠ authorization separation holds;  
3. Secrets ≠ Configuration holds;  
4. No Universal Security/Identity Controller emerges;  
5. ATI product meaning is not absorbed;  
6. F-003…F-005 boundaries remain intact.

---

# 10. ATI Boundary

| Allowed | Forbidden |
|---|---|
| AI-TOS protects ATI interactions via S-01/S-02 on Platform paths | AI-TOS owns Strategy / Trading Intelligence / Opportunity |
| ATI principals consume A-01 under Access/Security | AI-TOS owns Business Decisions / Risk/Portfolio meaning |
| Carriage of product context under protection | AI-TOS owns Product Experience / Trading OS |
| | Access denial interpreted as ATI Business Decision |

Platform ≠ ATI Product remains absolute.

---

# 11. Invalid Conditions

Security/identity realization is invalid when any of the following occur:

1. SA-009 and SA-013 are merged into one owner or one “security-identity brain.”  
2. Authentication and authorization are collapsed into one ambiguous owner.  
3. Access denial is treated as Business Decision.  
4. Secrets are managed as ordinary configuration.  
5. Universal Security Controller / Identity Controller / Platform Security Brain is introduced.  
6. S-07 or S-09 seize Security ownership.  
7. S-10 seizes Security ownership via integration convenience.  
8. IdP/IAM/OAuth/OIDC/cloud IAM/secret-manager/vendor is selected inside F-006.  
9. F-003…F-005 are redesigned.  
10. ATI product capabilities are implemented as Platform security/identity ownership.  
11. Unauthorized access is treated as semantic ownership transfer.  
12. SA-016 is created via security-platform naming.

---

# 12. Phase F Next-Step Boundary

F-006 authorizes later Phase F work to:

1. Select identity/security technologies per F-001 criteria;  
2. Bind authentication/authorization mechanisms to M-03/M-04/M-05/M-06 without merging SA jobs;  
3. Implement A-02/A-03 and R-04/R-05 under F-004/F-005;  
4. Define detailed credential rotation/revocation schemes;  
5. Produce tests for denial ≠ Decision and Secrets ≠ Configuration.

F-006 does **not** authorize technology selection, protocol freeze, code, deployment topology, or Phase G ATI security-as-product-ownership.

---

# 13. Conformance

1. Every Phase F security/identity realization must cite F-006, F-001…F-005, E-001…E-010, AI-TOS-000, and SA-000…SA-015.  
2. Must not redefine higher constitutions or absorb ATI.  
3. Non-conformance is a defect.

**Conformance sentence:**

> This work conforms to AI-TOS-000, UAIA v1.0, ATI Constitution, DDD Constitution, PRODUCT Constitution, Platform Architecture v1.0 (SA-000…SA-015), E-001 through E-010, F-001 through F-005, and F-006 AI-TOS Security and Identity Realization; it does not redefine them.

---

# 14. Freeze Recommendation

**Recommendation:** Accept **F-006** as the Implementation Architecture security and identity realization model for Phase F.  
**Status remains:** Implementation Architecture — **NOT FROZEN**.

**Effect of acceptance (not freeze):**

- Later F documents may bind S-01/S-02 to concrete identity/security technologies.  
- No IdP, IAM, or secret-manager product is selected by F-006.  
- Access remains determination; Security remains protection; Secrets remain non-config.  
- Freeze requires Board confirmation that seams, flows, failure laws, and invalid-condition protections hold.

**Board posture:**

Identify the principal.  
Determine access.  
Protect the operation.  
Keep secrets out of configuration.  
Deny without deciding business.  
Protect ATI calls — do not own ATI.

---

## End of F-006

**S-01 determines access. S-02 protects. Authn ≠ authz. Denial ≠ Decision. Secrets ≠ Config. No security brain. No technology yet.**
