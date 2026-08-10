#!/usr/bin/env bash
# Temporary migration validation (001→010). Do not use in production.
# Invoked by .github/workflows/migrate-validate-temp.yml
set -euo pipefail

ROOT="${GITHUB_WORKSPACE:-$(cd "$(dirname "$0")/../.." && pwd)}"
MIG_DIR="$ROOT/packages/database/migrations"
ADMIN_URL="${DATABASE_ADMIN_URL:?DATABASE_ADMIN_URL required}"
BASE_URL="${DATABASE_BASE_URL:?DATABASE_BASE_URL required}"

PASS=0
FAIL=0
result() {
  local name="$1" status="$2"
  if [[ "$status" == "PASS" ]]; then
    PASS=$((PASS + 1))
    echo "RESULT $name: PASS"
  else
    FAIL=$((FAIL + 1))
    echo "RESULT $name: FAIL — $status"
  fi
}

psql_admin() {
  psql "$ADMIN_URL" -v ON_ERROR_STOP=1 "$@"
}

psql_db() {
  local dburl="$1"
  shift
  psql "$dburl" -v ON_ERROR_STOP=1 "$@"
}

run_migrate() {
  local dburl="$1"
  (
    cd "$ROOT"
    export DATABASE_URL="$dburl"
    export NODE_ENV=development
    pnpm --filter @ai-tos/database migrate
  )
}

db_url() {
  # Replace trailing /dbname with /$1
  echo "${BASE_URL%/}/$1"
}

echo "=== Fresh 001→010 ==="
FRESH_DB="aitos_mig_fresh"
psql_admin -c "DROP DATABASE IF EXISTS ${FRESH_DB};"
psql_admin -c "CREATE DATABASE ${FRESH_DB};"
FRESH_URL="$(db_url "$FRESH_DB")"

if run_migrate "$FRESH_URL"; then
  result "fresh_migrate" "PASS"
else
  result "fresh_migrate" "migrate exited non-zero"
fi

MIG_COUNT="$(psql_db "$FRESH_URL" -tAc "SELECT COUNT(*) FROM _migrations")"
MIG_NAMES="$(psql_db "$FRESH_URL" -tAc "SELECT string_agg(name, ',' ORDER BY name) FROM _migrations")"
echo "migrations count=$MIG_COUNT names=$MIG_NAMES"
if [[ "$MIG_COUNT" == "10" ]] && [[ "$MIG_NAMES" == "001_init.sql,002_auth_foundation.sql,003_organizations.sql,004_rbac.sql,005_rbac_seed.sql,006_user_profiles.sql,007_api_keys.sql,008_user_sessions.sql,009_audit_logs.sql,010_audit_logs_schema_reconcile.sql" ]]; then
  result "fresh_migration_files" "PASS"
else
  result "fresh_migration_files" "expected 10 ordered files, got count=$MIG_COUNT names=$MIG_NAMES"
fi

HAS_ORG="$(psql_db "$FRESH_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='organization_id'")"
HAS_ACTOR="$(psql_db "$FRESH_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='actor'")"
ID_TYPE="$(psql_db "$FRESH_URL" -tAc "SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='id'")"
echo "audit_logs organization_id=$HAS_ORG actor=$HAS_ACTOR id_type=$ID_TYPE"
if [[ "$HAS_ORG" == "1" && "$HAS_ACTOR" == "0" && "$ID_TYPE" == "uuid" ]]; then
  result "final_schema" "PASS"
else
  result "final_schema" "organization_id=$HAS_ORG actor=$HAS_ACTOR id_type=$ID_TYPE"
fi

IDX="$(psql_db "$FRESH_URL" -tAc "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND indexname IN ('idx_audit_logs_org_created','idx_audit_logs_user_created','idx_audit_logs_action','idx_audit_logs_created')")"
echo "indexes present=$IDX/4"
if [[ "$IDX" == "4" ]]; then
  result "indexes" "PASS"
else
  result "indexes" "found $IDX of 4 expected indexes"
fi

echo "=== Idempotent rerun ==="
if run_migrate "$FRESH_URL"; then
  MIG_COUNT2="$(psql_db "$FRESH_URL" -tAc "SELECT COUNT(*) FROM _migrations")"
  if [[ "$MIG_COUNT2" == "10" ]]; then
    result "idempotent_rerun" "PASS"
  else
    result "idempotent_rerun" "second run changed _migrations count to $MIG_COUNT2"
  fi
else
  result "idempotent_rerun" "second migrate exited non-zero"
fi

echo "=== Phase-0 upgrade ==="
PHASE_DB="aitos_mig_phase0"
psql_admin -c "DROP DATABASE IF EXISTS ${PHASE_DB};"
psql_admin -c "CREATE DATABASE ${PHASE_DB};"
PHASE_URL="$(db_url "$PHASE_DB")"

psql_db "$PHASE_URL" -f "$MIG_DIR/001_init.sql"
psql_db "$PHASE_URL" -c "INSERT INTO audit_logs (actor, action, payload) VALUES ('validator', 'test.action', '{\"k\":1}'::jsonb);"
LEGACY_BEFORE="$(psql_db "$PHASE_URL" -tAc "SELECT COUNT(*) FROM audit_logs WHERE actor='validator'")"
HAS_ACTOR_BEFORE="$(psql_db "$PHASE_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='actor'")"
echo "phase0 before: rows=$LEGACY_BEFORE actor_col=$HAS_ACTOR_BEFORE"
if [[ "$LEGACY_BEFORE" == "1" && "$HAS_ACTOR_BEFORE" == "1" ]]; then
  result "phase0_seed" "PASS"
else
  result "phase0_seed" "rows=$LEGACY_BEFORE actor_col=$HAS_ACTOR_BEFORE"
fi

if run_migrate "$PHASE_URL"; then
  result "phase0_migrate" "PASS"
else
  result "phase0_migrate" "migrate exited non-zero"
fi

LEGACY_AFTER="$(psql_db "$PHASE_URL" -tAc "SELECT COUNT(*) FROM audit_logs_phase0_legacy WHERE actor='validator'")"
LIVE_ACTOR="$(psql_db "$PHASE_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='actor'")"
LIVE_ORG="$(psql_db "$PHASE_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='organization_id'")"
DROP_CHECK="$(psql_db "$PHASE_URL" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='audit_logs_phase0_legacy'")"
echo "phase0 after: legacy_rows=$LEGACY_AFTER live_actor=$LIVE_ACTOR live_org=$LIVE_ORG legacy_table=$DROP_CHECK"

if [[ "$LEGACY_AFTER" == "1" && "$DROP_CHECK" == "1" ]]; then
  result "data_preservation" "PASS"
else
  result "data_preservation" "legacy_rows=$LEGACY_AFTER legacy_table=$DROP_CHECK"
fi

if [[ "$LIVE_ORG" == "1" && "$LIVE_ACTOR" == "0" ]]; then
  result "phase0_final_schema" "PASS"
else
  result "phase0_final_schema" "live_org=$LIVE_ORG live_actor=$LIVE_ACTOR"
fi

IDX2="$(psql_db "$PHASE_URL" -tAc "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND indexname IN ('idx_audit_logs_org_created','idx_audit_logs_user_created','idx_audit_logs_action','idx_audit_logs_created')")"
if [[ "$IDX2" == "4" ]]; then
  result "phase0_indexes" "PASS"
else
  result "phase0_indexes" "found $IDX2 of 4"
fi

# Cleanup disposable DBs
psql_admin -c "DROP DATABASE IF EXISTS ${FRESH_DB};" || true
psql_admin -c "DROP DATABASE IF EXISTS ${PHASE_DB};" || true

echo "=== SUMMARY pass=$PASS fail=$FAIL ==="
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
