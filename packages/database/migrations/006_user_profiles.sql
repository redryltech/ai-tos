-- Phase 1.4 — User profiles (1:1 with users)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'system',
  notification_preferences JSONB NOT NULL DEFAULT '{"email":true,"push":true,"inApp":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_theme_chk
    CHECK (theme IN ('light', 'dark', 'system')),
  CONSTRAINT user_profiles_full_name_len_chk
    CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 1 AND 120),
  CONSTRAINT user_profiles_phone_len_chk
    CHECK (phone IS NULL OR char_length(phone) BETWEEN 3 AND 32),
  CONSTRAINT user_profiles_language_len_chk
    CHECK (char_length(language) BETWEEN 2 AND 16),
  CONSTRAINT user_profiles_timezone_len_chk
    CHECK (char_length(timezone) BETWEEN 1 AND 64)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_updated
  ON user_profiles (updated_at DESC);
