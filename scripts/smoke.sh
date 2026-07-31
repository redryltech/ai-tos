#!/usr/bin/env bash
# Phase 0B.7 — post-deploy smoke / health checks.
set -euo pipefail

BASE_URL="${SMOKE_BASE_URL:-http://localhost:3000}"
API_URL="${SMOKE_API_URL:-http://localhost:4000}"
AI_URL="${SMOKE_AI_URL:-http://localhost:8000}"

echo "==> Smoke against BASE=${BASE_URL} API=${API_URL} AI=${AI_URL}"

check() {
  local name="$1" url="$2"
  echo "— ${name}: ${url}"
  curl -fsS --max-time 15 "${url}" >/dev/null
  echo "  OK"
}

check "web"       "${BASE_URL}/"
check "api-health" "${API_URL}/api/health"
check "ai-health"  "${AI_URL}/health"

# Optional worker health endpoints when URLs are provided.
for pair in \
  "market:${SMOKE_MARKET_URL:-}" \
  "risk:${SMOKE_RISK_URL:-}" \
  "news:${SMOKE_NEWS_URL:-}" \
  "scheduler:${SMOKE_SCHEDULER_URL:-}"; do
  name="${pair%%:*}"
  url="${pair#*:}"
  if [[ -n "${url}" ]]; then
    check "${name}-health" "${url%/}/health"
  fi
done

echo "==> Smoke passed"
