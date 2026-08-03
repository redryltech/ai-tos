-- Phase 1.5 — Organization-scoped encrypted API keys
CREATE TABLE IF NOT EXISTS organization_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  key_ciphertext TEXT NOT NULL,
  key_nonce TEXT NOT NULL,
  key_auth_tag TEXT NOT NULL,
  key_last4 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT organization_api_keys_provider_chk CHECK (provider IN (
    'openai',
    'google_gemini',
    'anthropic_claude',
    'market_data',
    'broker',
    'email',
    'telegram_bot',
    'webhook',
    'custom'
  )),
  CONSTRAINT organization_api_keys_status_chk CHECK (status IN ('active', 'revoked')),
  CONSTRAINT organization_api_keys_name_len_chk CHECK (char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT organization_api_keys_last4_len_chk CHECK (char_length(key_last4) = 4)
);

CREATE INDEX IF NOT EXISTS idx_org_api_keys_org
  ON organization_api_keys (organization_id);

CREATE INDEX IF NOT EXISTS idx_org_api_keys_org_provider
  ON organization_api_keys (organization_id, provider)
  WHERE status = 'active';
