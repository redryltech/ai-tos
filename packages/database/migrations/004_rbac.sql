-- Phase 1.3 — RBAC (org-scoped roles & permissions)
-- AUTHORIZATION SOURCE OF TRUTH: organization_user_roles (+ rbac_role_permissions).
-- Do not authorize from organization_members.role (membership/tenancy only).
CREATE TABLE IF NOT EXISTS rbac_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rbac_permissions_action_chk
    CHECK (action IN ('create', 'read', 'update', 'delete', 'manage'))
);

CREATE TABLE IF NOT EXISTS rbac_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT true,
  rank INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rbac_roles_key_chk
    CHECK (key IN ('owner', 'admin', 'manager', 'analyst', 'viewer'))
);

CREATE TABLE IF NOT EXISTS rbac_role_permissions (
  role_id UUID NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS organization_user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES rbac_roles(id) ON DELETE RESTRICT,
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_org_user_roles_lookup
  ON organization_user_roles (organization_id, user_id);
