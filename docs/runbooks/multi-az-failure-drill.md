# Multi-AZ Failure Drill — Staging (Phase 0B.8)

Quarterly (minimum). Execute only in **staging**.

## Preconditions

- [ ] Change window approved; on-call notified
- [ ] Observability dashboards open (Grafana platform-health)
- [ ] `scripts/smoke.sh` baseline green against staging URLs

## Drill A — AZ cordon (EKS)

1. Cordon/drain nodes in one AZ (`kubectl drain` with `--ignore-daemonsets`).
2. Confirm pods reschedule to remaining AZs.
3. Smoke + check p99 / error-rate alerts quiet within RTO budget.

## Drill B — RDS AZ failover

1. Reboot RDS with failover (`aws rds reboot-db-instance --force-failover`).
2. Measure time to healthy connections; confirm no data loss (RPO).
3. Smoke API health.

## Drill C — MSK broker loss

1. Simulate broker unreachable (security-group deny or stop in staging only).
2. Confirm producers/consumers reconnect; lag recovers.
3. Clear simulation; verify ISR.

## Exit

- Record wall-clock RTO per drill in the change ticket.
- File gaps as issues; do not promote to prod until staging RTO ≤ targets in `rpo-rto.md`.
