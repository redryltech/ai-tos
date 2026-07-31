# KMS module

Creates customer-managed CMKs for the foundation, one per purpose:

- `s3` — artifact/state bucket encryption
- `logs` — centralized log archive encryption
- `backup` — AWS Backup vault encryption
- `secrets` — Secrets Manager / future sensitive data

All keys: annual rotation enabled, 30-day deletion window, key policy grants the account
root + the scoped Terraform role. Swap in a BYOK/imported key later if required.
