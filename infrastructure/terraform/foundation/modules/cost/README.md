# Cost module

- **Cost allocation tags** activated: `Project`, `Environment`, `Team`, `CostCenter`, `Owner`
  — these power Tag Policies, chargeback, and the budget filter. Apply them everywhere
  (enforced via provider `default_tags` in each environment).
- **Monthly budget** with 80% actual and 100% forecasted alerts emailed to the FinOps owner.

Tune `monthly_budget_amount` per environment; wire alerts to a Slack/SNS topic in Phase 0B.2.
