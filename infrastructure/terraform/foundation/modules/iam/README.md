# IAM module

- **OIDC provider** for `token.actions.githubusercontent.com` (GitHub Actions) with the
  published thumbprint — no static CI keys (ADR-0011).
- **`terraform` role** — assumed via OIDC, scoped least-privilege policy (state backend,
  IAM PassRole for `ai-tos-*` roles, networking tagged `Project=ai-tos`, KMS scoped, security
  service enablement). Tighten per environment.
- **`admin` (break-glass)** — `AdministratorAccess` **gated by MFA**; emergency only.
- **`developer`** — `ViewOnlyAccess`, MFA-gated (real access via IAM Identity Center).
- **`cross_account`** — assumable by Shared Services (external-id protected) for centralized
  management; `ReadOnlyAccess`.
- **Access Analyzer** — `ACCOUNT` per account; `ORGANIZATION` in the security hub account.
