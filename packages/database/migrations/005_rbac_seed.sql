-- Phase 1.3 — seed frozen RBAC roles + permission matrix
INSERT INTO rbac_roles (key, name, description, is_system, rank) VALUES
  ('owner',   'Owner',   'Full access to everything',  true, 100),
  ('admin',   'Admin',   'Manage users, roles, reports, settings (not ownership)', true, 80),
  ('manager', 'Manager', 'Manage analysts, approve reports, team watchlists', true, 60),
  ('analyst', 'Analyst', 'Use AI engines, watchlists, generate reports', true, 40),
  ('viewer',  'Viewer',  'Read-only access', true, 20)
ON CONFLICT (key) DO NOTHING;

-- Permissions: resource × action
INSERT INTO rbac_permissions (resource, action, key, description)
SELECT r, a, r || ':' || a, initcap(a) || ' ' || replace(r, '_', ' ')
FROM (VALUES
  ('organization'),('users'),('roles'),('reports'),('watchlists'),
  ('portfolio'),('ai_engines'),('api_keys'),('settings')
) AS resources(r)
CROSS JOIN (VALUES ('create'),('read'),('update'),('delete'),('manage')) AS actions(a)
ON CONFLICT (key) DO NOTHING;

-- Owner: every permission
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT roles.id, p.id
FROM rbac_roles roles
CROSS JOIN rbac_permissions p
WHERE roles.key = 'owner'
ON CONFLICT DO NOTHING;

-- Admin: manage/CRUD on users, roles, reports, watchlists, portfolio, ai_engines, api_keys, settings
-- Organization: read/update only (no delete/manage ownership)
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT roles.id, p.id
FROM rbac_roles roles
JOIN rbac_permissions p ON (
  (p.resource = 'organization' AND p.action IN ('read', 'update'))
  OR (p.resource IN ('users','roles','reports','watchlists','portfolio','ai_engines','api_keys','settings')
      AND p.action IN ('create','read','update','delete','manage'))
)
WHERE roles.key = 'admin'
ON CONFLICT DO NOTHING;

-- Manager: analysts/users read+update; reports read/update/manage; watchlists full; portfolio/ai read; settings read
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT roles.id, p.id
FROM rbac_roles roles
JOIN rbac_permissions p ON (
  (p.resource = 'organization' AND p.action = 'read')
  OR (p.resource = 'users' AND p.action IN ('read', 'update'))
  OR (p.resource = 'reports' AND p.action IN ('create','read','update','manage'))
  OR (p.resource = 'watchlists' AND p.action IN ('create','read','update','delete','manage'))
  OR (p.resource IN ('portfolio','ai_engines') AND p.action IN ('read'))
  OR (p.resource = 'settings' AND p.action = 'read')
  OR (p.resource = 'roles' AND p.action = 'read')
)
WHERE roles.key = 'manager'
ON CONFLICT DO NOTHING;

-- Analyst: AI engines, watchlists, reports create/read/update; portfolio/organization read
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT roles.id, p.id
FROM rbac_roles roles
JOIN rbac_permissions p ON (
  (p.resource = 'organization' AND p.action = 'read')
  OR (p.resource = 'ai_engines' AND p.action IN ('create','read','update'))
  OR (p.resource = 'watchlists' AND p.action IN ('create','read','update','delete'))
  OR (p.resource = 'reports' AND p.action IN ('create','read','update'))
  OR (p.resource = 'portfolio' AND p.action = 'read')
  OR (p.resource IN ('users','roles','settings','api_keys') AND p.action = 'read')
)
WHERE roles.key = 'analyst'
ON CONFLICT DO NOTHING;

-- Viewer: read-only on all resources
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT roles.id, p.id
FROM rbac_roles roles
JOIN rbac_permissions p ON p.action = 'read'
WHERE roles.key = 'viewer'
ON CONFLICT DO NOTHING;
