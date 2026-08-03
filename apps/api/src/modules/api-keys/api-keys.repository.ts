import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import type { ApiKeyProvider } from '@ai-tos/shared';
import type { ApiKeyRow } from './api-key.mapper';

@Injectable()
export class ApiKeysRepository {
  async create(params: {
    organizationId: string;
    provider: ApiKeyProvider;
    name: string;
    ciphertext: string;
    nonce: string;
    authTag: string;
    keyLast4: string;
    createdBy: string;
  }): Promise<ApiKeyRow> {
    const result = await query(
      `INSERT INTO organization_api_keys (
         organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
         key_last4, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
                 key_last4, status, created_by, revoked_at, created_at, updated_at`,
      [
        params.organizationId,
        params.provider,
        params.name,
        params.ciphertext,
        params.nonce,
        params.authTag,
        params.keyLast4,
        params.createdBy,
      ],
    );
    return result.rows[0] as ApiKeyRow;
  }

  async listByOrg(organizationId: string): Promise<ApiKeyRow[]> {
    const result = await query(
      `SELECT id, organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
              key_last4, status, created_by, revoked_at, created_at, updated_at
       FROM organization_api_keys
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [organizationId],
    );
    return result.rows as ApiKeyRow[];
  }

  async findById(organizationId: string, id: string): Promise<ApiKeyRow | null> {
    const result = await query(
      `SELECT id, organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
              key_last4, status, created_by, revoked_at, created_at, updated_at
       FROM organization_api_keys
       WHERE organization_id = $1 AND id = $2`,
      [organizationId, id],
    );
    return (result.rows[0] as ApiKeyRow | undefined) ?? null;
  }

  async updateMeta(
    organizationId: string,
    id: string,
    patch: { name?: string; provider?: ApiKeyProvider },
  ): Promise<ApiKeyRow | null> {
    const result = await query(
      `UPDATE organization_api_keys SET
         name = COALESCE($3, name),
         provider = COALESCE($4, provider),
         updated_at = now()
       WHERE organization_id = $1 AND id = $2 AND status = 'active'
       RETURNING id, organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
                 key_last4, status, created_by, revoked_at, created_at, updated_at`,
      [organizationId, id, patch.name ?? null, patch.provider ?? null],
    );
    return (result.rows[0] as ApiKeyRow | undefined) ?? null;
  }

  async rotateSecret(
    organizationId: string,
    id: string,
    secret: {
      ciphertext: string;
      nonce: string;
      authTag: string;
      keyLast4: string;
    },
  ): Promise<ApiKeyRow | null> {
    const result = await query(
      `UPDATE organization_api_keys SET
         key_ciphertext = $3,
         key_nonce = $4,
         key_auth_tag = $5,
         key_last4 = $6,
         updated_at = now()
       WHERE organization_id = $1 AND id = $2 AND status = 'active'
       RETURNING id, organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
                 key_last4, status, created_by, revoked_at, created_at, updated_at`,
      [
        organizationId,
        id,
        secret.ciphertext,
        secret.nonce,
        secret.authTag,
        secret.keyLast4,
      ],
    );
    return (result.rows[0] as ApiKeyRow | undefined) ?? null;
  }

  async revoke(organizationId: string, id: string): Promise<ApiKeyRow | null> {
    const result = await query(
      `UPDATE organization_api_keys SET
         status = 'revoked',
         revoked_at = now(),
         updated_at = now()
       WHERE organization_id = $1 AND id = $2 AND status = 'active'
       RETURNING id, organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
                 key_last4, status, created_by, revoked_at, created_at, updated_at`,
      [organizationId, id],
    );
    return (result.rows[0] as ApiKeyRow | undefined) ?? null;
  }

  async delete(organizationId: string, id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM organization_api_keys WHERE organization_id = $1 AND id = $2`,
      [organizationId, id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async findActiveByProvider(
    organizationId: string,
    provider: ApiKeyProvider,
  ): Promise<ApiKeyRow[]> {
    const result = await query(
      `SELECT id, organization_id, provider, name, key_ciphertext, key_nonce, key_auth_tag,
              key_last4, status, created_by, revoked_at, created_at, updated_at
       FROM organization_api_keys
       WHERE organization_id = $1 AND provider = $2 AND status = 'active'
       ORDER BY created_at DESC`,
      [organizationId, provider],
    );
    return result.rows as ApiKeyRow[];
  }
}
