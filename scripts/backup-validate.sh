#!/usr/bin/env bash
# Phase 0B.9 — scheduled backup validation (staging-safe checks).
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ENV="${AI_TOS_ENV:-staging}"
FAIL=0

echo "==> Backup validation env=${ENV} region=${REGION}"

require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "missing $1"; exit 1; }; }
require_cmd aws
require_cmd jq

# RDS: at least one automated/manual snapshot in lookback
RDS_ID="${AI_TOS_RDS_INSTANCE_ID:-}"
if [[ -n "${RDS_ID}" ]]; then
  COUNT=$(aws rds describe-db-snapshots --region "$REGION" --db-instance-identifier "$RDS_ID" \
    --query 'length(DBSnapshots[?Status==`available`])' --output text 2>/dev/null || echo 0)
  echo "RDS snapshots available: ${COUNT}"
  [[ "${COUNT}" -ge 1 ]] || { echo "FAIL: no RDS snapshots"; FAIL=1; }
else
  echo "SKIP RDS (set AI_TOS_RDS_INSTANCE_ID)"
fi

# ElastiCache Redis state: snapshot window configured
REDIS_ID="${AI_TOS_REDIS_STATE_ID:-}"
if [[ -n "${REDIS_ID}" ]]; then
  WINDOW=$(aws elasticache describe-cache-clusters --region "$REGION" --cache-cluster-id "$REDIS_ID" \
    --show-cache-node-info --query 'CacheClusters[0].SnapshotWindow' --output text 2>/dev/null || echo none)
  echo "Redis snapshot window: ${WINDOW}"
  [[ "${WINDOW}" != "None" && "${WINDOW}" != "none" && "${WINDOW}" != "null" ]] || { echo "WARN: no snapshot window"; }
else
  echo "SKIP Redis (set AI_TOS_REDIS_STATE_ID)"
fi

# S3 backup bucket versioning
BUCKET="${AI_TOS_BACKUP_BUCKET:-}"
if [[ -n "${BUCKET}" ]]; then
  STATUS=$(aws s3api get-bucket-versioning --region "$REGION" --bucket "$BUCKET" --query 'Status' --output text 2>/dev/null || echo Disabled)
  echo "Backup bucket versioning: ${STATUS}"
  [[ "${STATUS}" == "Enabled" ]] || { echo "FAIL: versioning not Enabled"; FAIL=1; }
else
  echo "SKIP S3 (set AI_TOS_BACKUP_BUCKET)"
fi

[[ "${FAIL}" -eq 0 ]] && echo "==> Backup validation passed" || { echo "==> Backup validation failed"; exit 1; }
