# Organizations module (Management account)

Establishes the AI-TOS landing zone:

- **OU structure:** `SharedServices`, `Dev`, `Staging`, `Prod`.
- **Accounts:** one per OU (emails are placeholders — supply real unique addresses).
- **Guardrail SCP** attached to the org root: denies root-credential wide actions and
  restricts API calls to `allowed_regions` (us-east-1, us-west-2).
- **Delegated admin:** Shared Services is the GuardDuty + Security Hub delegated admin
  (centralizes detection/aggregation).

> Applied once from the **management account** (us-east-1), before per-account baselines.
> Account IDs produced here feed each environment's `account-baseline` (cross-account roles,
> log delivery).
