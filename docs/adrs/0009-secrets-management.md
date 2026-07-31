# ADR-0009: Secrets management — AWS Secrets Manager + KMS + External Secrets Operator

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; wiring in Phase 0B)

## Context

Phase 0A used a static Kubernetes `Secret` with `CHANGE_ME` placeholders and a Secrets
Manager secret with a hardcoded placeholder value, encryption by the AWS-managed default
key, no rotation, and no least-privilege IAM. The board (verdict: ⚠ APPROVED WITH CHANGES,
Priority 6) requires production-grade secrets: AWS Secrets Manager, External Secrets
Operator, rotation, KMS CMK, and least privilege.

## Decision

### Store — AWS Secrets Manager
- All runtime secrets (DB credentials, `JWT_SECRET`, LLM API keys, broker creds later)
  live in **AWS Secrets Manager**, one secret per service/environment
  (`ai-tos/<environment>/<service>`).
- Encrypted with a **dedicated KMS Customer Managed Key (CMK)** (`aws/secretsmanager`
  key policy scoped to the app + CI principals), not the AWS default key.

### Rotation
- **Automatic rotation** enabled: 30–90 day rotation for DB credentials via the
  Secrets Manager Lambda rotation function (single-user or multi-user scheme); LLM keys
  rotated on credential compromise / per provider policy. Rotation events are logged and
  alerted (ADR-0010).

### Sync — External Secrets Operator (ESO)
- **ESO** runs in-cluster; `SecretStore`/`ClusterSecretStore` uses **IRSA** (OIDC) to read
  Secrets Manager. `ExternalSecret` resources sync SM → native `Secret` (or directly to
  pod env). The static `infrastructure/kubernetes/secret.yaml` is **deleted**; placeholders
  removed.

### Least privilege (IAM)
- Per-service IAM roles via **IRSA** (`RoleArn` + OIDC trust scoped to `namespace` +
  `serviceAccount`). Each role gets `secretsmanager:GetSecretValue` **only** on its own
  secret ARN — no `*` on `secretsmanager:*`. ESO's role is narrowly scoped to the
  `ai-tos/*` secret paths it manages.
- CI uses **OIDC** (ADR-0011), never long-lived keys; rotation Lambda has least-privilege
  on its specific secret + DB.

### Break-glass & lifecycle
- Documented break-glass (emergency access via approved, audited assume-role).
- Secret access is logged to CloudTrail; anomalous access alerted.

## Alternatives considered

- **Static K8s Secrets only** — *Rejected* (current): plaintext-at-rest risk, no rotation,
  manual drift.
- **Sealed Secrets / SOPS** — good for git-encrypted secrets, but we standardize on a
  managed store (SM) + ESO for rotation and audit.
- **Vault** — powerful, but adds a self-managed HA control plane; SM+ESO meets needs with
  less ops. Revisit if dynamic secrets/mesh PKI are required.

## Consequences

- No secret lives in git or in a static manifest.
- Rotation is automatic and auditable; blast radius per secret is minimal.
- ESO + IRSA remove static cloud credentials from pods and pipelines.

## References

- `infrastructure/terraform/modules/secrets/` (KMS + rotation),
  `infrastructure/kubernetes/kustomize/` (ESO install + `ExternalSecret`s),
  ADR-0008 (state), ADR-0011 (OIDC), `docs/review-board-changes.md` Priority 6.
