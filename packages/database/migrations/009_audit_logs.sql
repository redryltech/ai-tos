-- Phase 1.7 — Append-only audit logs + RBAC permissions
--
-- Reconciliation: 001_init.sql created a Phase-0 audit_logs shape (BIGSERIAL + actor/payload).
-- Application code expects the Phase-1.7 org-scoped UUID schema. CREATE TABLE IF NOT EXISTS
-- alone cannot reshape an existing table; indexes on organization_id would fail on fresh upgrades.
-- Preserve Phase-0 rows by renaming, then create the current schema.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_logs'
      AND column_name = 'actor'
  ) THEN
    ALTER TABLE audit_logs RENAME TO audit_logs_phase0_legacy;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created
  ON audit_logs (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON audit_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs (action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created
  ON audit_logs (created_at DESC);

-- Extend RBAC with audit_logs resource
INSERT INTO rbac_permissions (resource, action, key, description)
SELECT 'audit_logs', a, 'audit_logs:' || a, initcap(a) || ' audit logs'
FROM (VALUES ('create'),('read'),('update'),('delete'),('manage')) AS actions(a)
ON CONFLICT (key) DO NOTHING;

INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
CROSS JOIN rbac_permissions p
WHERE r.key = 'owner' AND p.resource = 'audit_logs'
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
JOIN rbac_permissions p ON p.resource = 'audit_logs' AND p.action IN ('read', 'manage')
WHERE r.key = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
JOIN rbac_permissions p ON p.resource = 'audit_logs' AND p.action = 'read'
WHERE r.key = 'manager'
ON CONFLICT DO NOTHING;
