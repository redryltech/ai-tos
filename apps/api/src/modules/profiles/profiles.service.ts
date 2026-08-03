import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser, UserProfile } from '@ai-tos/shared';
import type { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  mergeNotificationPreferences,
  toPublicProfile,
} from './profile.utils';
import { ProfilesRepository, type ProfileWriteFields } from './profiles.repository';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly repo: ProfilesRepository,
    private readonly audit: AuditLogsService,
  ) {}

  async getMine(user: AuthUser): Promise<UserProfile> {
    const row = await this.repo.findByUserId(user.id);
    if (!row) throw new NotFoundException('Profile not found');
    return toPublicProfile(row);
  }

  async create(user: AuthUser, dto: CreateProfileDto): Promise<UserProfile> {
    const existing = await this.repo.findByUserId(user.id);
    if (existing) throw new ConflictException('Profile already exists');

    const fields: ProfileWriteFields = {
      fullName: dto.fullName ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      phone: dto.phone ?? null,
      timezone: dto.timezone ?? 'UTC',
      language: dto.language ?? 'en',
      theme: dto.theme ?? 'system',
      notificationPreferences: mergeNotificationPreferences(
        DEFAULT_NOTIFICATION_PREFERENCES,
        dto.notificationPreferences,
      ),
    };
    const row = await this.repo.upsert(user.id, fields);
    return toPublicProfile(row);
  }

  async update(
    user: AuthUser,
    dto: UpdateProfileDto,
    organizationId?: string | null,
  ): Promise<UserProfile> {
    const existing = await this.repo.findByUserId(user.id);
    if (!existing) throw new NotFoundException('Profile not found');

    const current = toPublicProfile(existing);
    const fields: ProfileWriteFields = {
      fullName: dto.fullName === undefined ? current.fullName : dto.fullName,
      avatarUrl: dto.avatarUrl === undefined ? current.avatarUrl : dto.avatarUrl,
      phone: dto.phone === undefined ? current.phone : dto.phone,
      timezone: dto.timezone ?? current.timezone,
      language: dto.language ?? current.language,
      theme: dto.theme ?? current.theme,
      notificationPreferences: mergeNotificationPreferences(
        current.notificationPreferences,
        dto.notificationPreferences,
      ),
    };
    const row = await this.repo.upsert(user.id, fields);
    const pub = toPublicProfile(row);
    await this.audit.record({
      action: 'profile.update',
      userId: user.id,
      organizationId,
      resourceId: user.id,
      metadata: { fields: Object.keys(dto) },
    });
    return pub;
  }

  async remove(user: AuthUser): Promise<void> {
    const ok = await this.repo.delete(user.id);
    if (!ok) throw new NotFoundException('Profile not found');
  }
}
