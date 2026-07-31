#!/usr/bin/env bash
# Phase 0B.9 — platform maintenance helpers (safe, idempotent).
set -euo pipefail

ACTION="${1:-help}"

case "$ACTION" in
  prune-images)
    echo "Prune dangling docker images (local/dev only)"
    docker image prune -f
    ;;
  helm-diff)
    CHART="${2:-infrastructure/kubernetes/helm/ai-tos}"
    echo "Render helm template sanity: ${CHART}"
    helm template ai-tos "$CHART" -f "${CHART}/values.yaml" >/dev/null
    echo "OK"
    ;;
  tf-fmt)
    terraform -chdir=infrastructure/terraform fmt -check -recursive || \
      terraform -chdir=infrastructure/terraform/foundation fmt -check -recursive
    ;;
  help|*)
    cat <<EOF
Usage: $0 <action>
  prune-images   Local docker dangling image prune
  helm-diff      helm template sanity check
  tf-fmt         terraform fmt -check
EOF
    [[ "$ACTION" == "help" ]] || exit 1
    ;;
esac
