/**
 * SQL shape checks for migration integrity (no live DB required).
 * Ensures Phase-0 audit_logs reshape remains present so fresh upgrades succeed.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

describe('database migration integrity', () => {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  it('ships ordered 001–010 migration files without gaps in the auth/audit chain', () => {
    assert.deepEqual(
      files.filter((f) => /^(001|002|003|004|005|006|007|008|009|010)_/.test(f)),
      [
        '001_init.sql',
        '002_auth_foundation.sql',
        '003_organizations.sql',
        '004_rbac.sql',
        '005_rbac_seed.sql',
        '006_user_profiles.sql',
        '007_api_keys.sql',
        '008_user_sessions.sql',
        '009_audit_logs.sql',
        '010_audit_logs_schema_reconcile.sql',
      ],
    );
  });

  it('009 reshapes Phase-0 audit_logs before creating Phase-1.7 schema', () => {
    const sql = readFileSync(join(MIGRATIONS_DIR, '009_audit_logs.sql'), 'utf8');
    assert.match(sql, /audit_logs_phase0_legacy/);
    assert.match(sql, /column_name = 'actor'/);
    assert.match(sql, /organization_id UUID/);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS audit_logs/);
  });

  it('010 is an idempotent forward reconcile for leftover Phase-0 audit_logs', () => {
    const sql = readFileSync(join(MIGRATIONS_DIR, '010_audit_logs_schema_reconcile.sql'), 'utf8');
    assert.match(sql, /audit_logs_phase0_legacy/);
    assert.match(sql, /organization_id UUID/);
  });

  it('001 Phase-0 audit_logs remains historically intact (no silent rewrite)', () => {
    const sql = readFileSync(join(MIGRATIONS_DIR, '001_init.sql'), 'utf8');
    assert.match(sql, /CREATE TABLE IF NOT EXISTS audit_logs/);
    assert.match(sql, /actor TEXT NOT NULL/);
  });
});
