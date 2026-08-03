import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import type { NotificationPreferences, ProfileTheme } from '@ai-tos/shared';

export interface UserProfileRow {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  timezone: string;
  language: string;
  theme: ProfileTheme;
  notification_preferences: NotificationPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface ProfileWriteFields {
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  timezone: string;
  language: string;
  theme: ProfileTheme;
  notificationPreferences: NotificationPreferences;
}

@Injectable()
export class ProfilesRepository {
  async findByUserId(userId: string): Promise<UserProfileRow | null> {
    const result = await query(
      `SELECT user_id, full_name, avatar_url, phone, timezone, language, theme,
              notification_preferences, created_at, updated_at
       FROM user_profiles
       WHERE user_id = $1`,
      [userId],
    );
    return (result.rows[0] as UserProfileRow | undefined) ?? null;
  }

  async upsert(userId: string, fields: ProfileWriteFields): Promise<UserProfileRow> {
    const result = await query(
      `INSERT INTO user_profiles (
         user_id, full_name, avatar_url, phone, timezone, language, theme, notification_preferences
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         avatar_url = EXCLUDED.avatar_url,
         phone = EXCLUDED.phone,
         timezone = EXCLUDED.timezone,
         language = EXCLUDED.language,
         theme = EXCLUDED.theme,
         notification_preferences = EXCLUDED.notification_preferences,
         updated_at = now()
       RETURNING user_id, full_name, avatar_url, phone, timezone, language, theme,
                 notification_preferences, created_at, updated_at`,
      [
        userId,
        fields.fullName,
        fields.avatarUrl,
        fields.phone,
        fields.timezone,
        fields.language,
        fields.theme,
        JSON.stringify(fields.notificationPreferences),
      ],
    );
    return result.rows[0] as UserProfileRow;
  }

  async delete(userId: string): Promise<boolean> {
    const result = await query(`DELETE FROM user_profiles WHERE user_id = $1`, [userId]);
    return (result.rowCount ?? 0) > 0;
  }
}
