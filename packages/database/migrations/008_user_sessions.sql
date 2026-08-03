-- Phase 1.6 — Authenticated user sessions (linked to refresh tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  refresh_token_id UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active
  ON user_sessions (user_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token
  ON user_sessions (refresh_token_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_hash
  ON user_sessions (refresh_token_hash)
  WHERE revoked_at IS NULL;
