import type { ApiKeyPublic, ApiKeyProvider, ApiKeyStatus } from '@ai-tos/shared';

export interface ApiKeyRow {
  id: string;
  organization_id: string;
  provider: ApiKeyProvider;
  name: string;
  key_ciphertext: string;
  key_nonce: string;
  key_auth_tag: string;
  key_last4: string;
  status: ApiKeyStatus;
  created_by: string;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** Map DB row → public DTO (never includes encrypted material). */
export function toPublicApiKey(row: ApiKeyRow): ApiKeyPublic {
  return {
    id: row.id,
    organizationId: row.organization_id,
    provider: row.provider,
    name: row.name,
    keyLast4: row.key_last4,
    status: row.status,
    createdBy: row.created_by,
    revokedAt: row.revoked_at ? row.revoked_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}
