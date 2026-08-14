#!/usr/bin/env bash
# Controlled platform image import (ADR-0018 Option B).
# Allowlist digests are authoritative. PUSH=true requires OIDC/ECR login.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ALLOWLIST="${ALLOWLIST:-$ROOT/docs/security/platform-image-allowlist.yaml}"
ECR_REGISTRY="${ECR_REGISTRY:-}"
PUSH="${PUSH:-false}"
OUT_DIR="${OUT_DIR:-$ROOT/.tools/platform-import}"
IMAGE_FILTER="${IMAGE_FILTER:-}"

mkdir -p "$OUT_DIR"
RESULTS="$OUT_DIR/results.jsonl"
: >"$RESULTS"

need() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: $1 required" >&2; exit 1; }; }
need crane
need trivy
need syft
need cosign
need node

ENTRIES_JSON=$(node "$ROOT/scripts/security/read-platform-allowlist.mjs" "$ALLOWLIST" "$IMAGE_FILTER")

COUNT=$(node -e "const a=JSON.parse(process.argv[1]); console.log(a.length)" "$ENTRIES_JSON")
if [[ "$COUNT" -eq 0 ]]; then
  echo "ERROR: no approved allowlist entries matched" >&2
  exit 1
fi

FAILED=0
for i in $(seq 0 $((COUNT - 1))); do
  id=$(node -e "const a=JSON.parse(process.argv[1]); console.log(a[process.argv[2]].id)" "$ENTRIES_JSON" "$i")
  ref=$(node -e "const a=JSON.parse(process.argv[1]); console.log(a[process.argv[2]].reference)" "$ENTRIES_JSON" "$i")
  want=$(node -e "const a=JSON.parse(process.argv[1]); console.log(a[process.argv[2]].digest)" "$ENTRIES_JSON" "$i")
  repo=$(node -e "const a=JSON.parse(process.argv[1]); console.log(a[process.argv[2]].ecr_repository)" "$ENTRIES_JSON" "$i")
  tag=$(node -e "const a=JSON.parse(process.argv[1]); console.log(a[process.argv[2]].human_tag)" "$ENTRIES_JSON" "$i")
  ups=$(node -e "const a=JSON.parse(process.argv[1]); console.log(a[process.argv[2]].upstream_signature)" "$ENTRIES_JSON" "$i")

  echo "=== $id ==="
  echo "source=$ref allowlisted=$want upstream_signature=$ups"

  resolved=$(crane digest "$ref")
  if [[ "$resolved" != "$want" ]]; then
    echo "BLOCKED: digest mismatch (resolved=$resolved)" >&2
    printf '%s\n' "{\"id\":\"$id\",\"status\":\"blocked\",\"reason\":\"digest_mismatch\",\"resolved\":\"$resolved\",\"allowlisted\":\"$want\"}" >>"$RESULTS"
    FAILED=1
    continue
  fi

  src_pin="${ref%%:*}@${want}"
  scan_out="$OUT_DIR/trivy-$id.json"
  if ! trivy image --severity HIGH,CRITICAL --exit-code 1 --format json --output "$scan_out" "$src_pin"; then
    echo "BLOCKED: Trivy HIGH/CRITICAL" >&2
    printf '%s\n' "{\"id\":\"$id\",\"status\":\"blocked\",\"reason\":\"trivy\",\"scan\":\"$scan_out\"}" >>"$RESULTS"
    FAILED=1
    continue
  fi

  sbom_out="$OUT_DIR/sbom-$id.cdx.json"
  syft "$src_pin" -o cyclonedx-json >"$sbom_out"

  if [[ "$PUSH" == "true" ]]; then
    if [[ -z "$ECR_REGISTRY" || "$ECR_REGISTRY" == "local.invalid" ]]; then
      echo "BLOCKED: ECR_REGISTRY required for push" >&2
      FAILED=1
      continue
    fi
    dest_tag="$ECR_REGISTRY/${repo}:${tag}"
    crane copy "$src_pin" "$dest_tag"
    dest_digest=$(crane digest "$dest_tag")
    export COSIGN_YES=true
    cosign sign --yes "$ECR_REGISTRY/${repo}@${dest_digest}"
    cosign attest --yes --predicate "$sbom_out" --type cyclonedx "$ECR_REGISTRY/${repo}@${dest_digest}"
    printf '%s\n' "{\"id\":\"$id\",\"status\":\"imported\",\"source_digest\":\"$want\",\"destination\":\"$ECR_REGISTRY/${repo}@${dest_digest}\",\"destination_digest\":\"$dest_digest\",\"sbom\":\"$sbom_out\",\"scan\":\"$scan_out\",\"upstream_signature\":\"$ups\"}" >>"$RESULTS"
    echo "IMPORTED -> $ECR_REGISTRY/${repo}@${dest_digest}"
  else
    printf '%s\n' "{\"id\":\"$id\",\"status\":\"validated_local\",\"source_digest\":\"$want\",\"destination_digest\":null,\"sbom\":\"$sbom_out\",\"scan\":\"$scan_out\",\"upstream_signature\":\"$ups\",\"push\":false}" >>"$RESULTS"
    echo "VALIDATED (no push) digest=$want"
  fi
done

echo "=== Summary ==="
cat "$RESULTS"
exit "$FAILED"
