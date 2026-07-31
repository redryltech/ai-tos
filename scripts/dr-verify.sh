#!/usr/bin/env bash
# Phase 0B.9 — DR recovery verification (non-destructive checks + optional restore dry-run flag).
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
DRY_RUN="${DR_DRY_RUN:-true}"

echo "==> DR recovery verification (dry_run=${DRY_RUN})"

command -v aws >/dev/null || { echo "aws CLI required"; exit 1; }

# 1) Confirm PITR / backup retention knobs exist when IDs provided
if [[ -n "${AI_TOS_RDS_INSTANCE_ID:-}" ]]; then
  RET=$(aws rds describe-db-instances --region "$REGION" --db-instance-identifier "$AI_TOS_RDS_INSTANCE_ID" \
    --query 'DBInstances[0].BackupRetentionPeriod' --output text)
  echo "RDS backup retention days: ${RET}"
  [[ "${RET}" -ge 1 ]] || { echo "FAIL: BackupRetentionPeriod < 1"; exit 1; }
fi

# 2) Confirm TF state bucket CRR/versioning if set
if [[ -n "${TF_STATE_BUCKET:-}" ]]; then
  VER=$(aws s3api get-bucket-versioning --region "$REGION" --bucket "$TF_STATE_BUCKET" --query 'Status' --output text 2>/dev/null || echo Disabled)
  echo "TF state versioning: ${VER}"
  [[ "${VER}" == "Enabled" ]] || { echo "FAIL: TF state versioning"; exit 1; }
fi

# 3) Optional restore dry-run: print restore command only
if [[ "${DRY_RUN}" == "true" && -n "${AI_TOS_RDS_INSTANCE_ID:-}" ]]; then
  echo "DRY-RUN restore command:"
  echo "  aws rds restore-db-instance-to-point-in-time \\"
  echo "    --source-db-instance-identifier ${AI_TOS_RDS_INSTANCE_ID} \\"
  echo "    --target-db-instance-identifier ${AI_TOS_RDS_INSTANCE_ID}-dr-test \\"
  echo "    --use-latest-restorable-time --region ${REGION}"
fi

# 4) Post-recovery smoke if URLs present
if [[ -n "${SMOKE_API_URL:-}" ]]; then
  bash "$(dirname "$0")/smoke.sh"
fi

echo "==> DR recovery verification passed"
