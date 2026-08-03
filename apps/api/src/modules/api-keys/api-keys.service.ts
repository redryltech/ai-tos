import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { loadConfig } from '@ai-tos/config';
import type { ApiKeyProvider, ApiKeyPublic, AuthUser } from '@ai-tos/shared';
import { decryptSecret, encryptSecret, keyLast4 } from './api-key.crypto';
import { toPublicApiKey } from './api-key.mapper';
import { ApiKeysRepository } from './api-keys.repository';
import type { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly repo: ApiKeysRepository,
    private readonly audit: AuditLogsService,
  ) {}

  private encryptionSecret(): string {
    return loadConfig().API_KEY_ENCRYPTION_SECRET;
  }

  async create(
    user: AuthUser,
    organizationId: string,
    dto: CreateApiKeyDto,
  ): Promise<ApiKeyPublic> {
    const encrypted = encryptSecret(dto.secret.trim(), this.encryptionSecret());
    const row = await this.repo.create({
      organizationId,
      provider: dto.provider,
      name: dto.name.trim(),
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
      authTag: encrypted.authTag,
      keyLast4: keyLast4(dto.secret),
      createdBy: user.id,
    });
    const pub = toPublicApiKey(row);
    await this.audit.record({
      action: 'api_key.create',
      organizationId,
      userId: user.id,
      resourceId: pub.id,
      metadata: { provider: pub.provider, name: pub.name, keyLast4: pub.keyLast4 },
    });
    return pub;
  }

  async list(organizationId: string): Promise<ApiKeyPublic[]> {
    const rows = await this.repo.listByOrg(organizationId);
    return rows.map(toPublicApiKey);
  }

  async get(organizationId: string, id: string): Promise<ApiKeyPublic> {
    const row = await this.repo.findById(organizationId, id);
    if (!row) throw new NotFoundException('API key not found');
    return toPublicApiKey(row);
  }

  async update(
    user: AuthUser,
    organizationId: string,
    id: string,
    dto: UpdateApiKeyDto,
  ): Promise<ApiKeyPublic> {
    if (dto.name === undefined && dto.provider === undefined && dto.secret === undefined) {
      throw new BadRequestException('No updates provided');
    }

    let row = await this.repo.findById(organizationId, id);
    if (!row) throw new NotFoundException('API key not found');
    if (row.status !== 'active') throw new BadRequestException('Cannot update a revoked API key');

    if (dto.name !== undefined || dto.provider !== undefined) {
      row =
        (await this.repo.updateMeta(organizationId, id, {
          name: dto.name?.trim(),
          provider: dto.provider,
        })) ?? row;
    }

    if (dto.secret !== undefined) {
      const encrypted = encryptSecret(dto.secret.trim(), this.encryptionSecret());
      const rotated = await this.repo.rotateSecret(organizationId, id, {
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        authTag: encrypted.authTag,
        keyLast4: keyLast4(dto.secret),
      });
      if (!rotated) throw new NotFoundException('API key not found');
      row = rotated;
    }

    const pub = toPublicApiKey(row);
    await this.audit.record({
      action: 'api_key.update',
      organizationId,
      userId: user.id,
      resourceId: id,
      metadata: {
        rotatedSecret: dto.secret !== undefined,
        name: dto.name,
        provider: dto.provider,
      },
    });
    return pub;
  }

  async revoke(user: AuthUser, organizationId: string, id: string): Promise<ApiKeyPublic> {
    const row = await this.repo.revoke(organizationId, id);
    if (!row) throw new NotFoundException('API key not found or already revoked');
    const pub = toPublicApiKey(row);
    await this.audit.record({
      action: 'api_key.revoke',
      organizationId,
      userId: user.id,
      resourceId: id,
    });
    return pub;
  }

  async remove(user: AuthUser, organizationId: string, id: string): Promise<void> {
    const ok = await this.repo.delete(organizationId, id);
    if (!ok) throw new NotFoundException('API key not found');
    await this.audit.record({
      action: 'api_key.delete',
      organizationId,
      userId: user.id,
      resourceId: id,
    });
  }

  /**
   * Decrypt plaintext for trusted internal callers only.
   * Never exposed via HTTP controllers.
   */
  async decryptForInternalUse(
    organizationId: string,
    id: string,
  ): Promise<{ provider: ApiKeyProvider; secret: string }> {
    const row = await this.repo.findById(organizationId, id);
    if (!row) throw new NotFoundException('API key not found');
    if (row.status !== 'active') throw new BadRequestException('API key is revoked');
    const secret = decryptSecret(
      {
        ciphertext: row.key_ciphertext,
        nonce: row.key_nonce,
        authTag: row.key_auth_tag,
      },
      this.encryptionSecret(),
    );
    return { provider: row.provider, secret };
  }

  /** Internal helper: decrypt first active key for a provider (if any). */
  async decryptActiveProviderKey(
    organizationId: string,
    provider: ApiKeyProvider,
  ): Promise<string | null> {
    const rows = await this.repo.findActiveByProvider(organizationId, provider);
    const row = rows[0];
    if (!row) return null;
    return decryptSecret(
      {
        ciphertext: row.key_ciphertext,
        nonce: row.key_nonce,
        authTag: row.key_auth_tag,
      },
      this.encryptionSecret(),
    );
  }
}
