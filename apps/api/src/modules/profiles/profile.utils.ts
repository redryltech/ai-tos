import type { NotificationPreferences, ProfileTheme, UserProfile } from '@ai-tos/shared';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
};

export function mergeNotificationPreferences(
  current: NotificationPreferences,
  patch?: Partial<NotificationPreferences>,
): NotificationPreferences {
  if (!patch) return { ...current };
  return {
    email: patch.email ?? current.email,
    push: patch.push ?? current.push,
    inApp: patch.inApp ?? current.inApp,
  };
}

export function isProfileTheme(value: string): value is ProfileTheme {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function toPublicProfile(row: {
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
}): UserProfile {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    timezone: row.timezone,
    language: row.language,
    theme: row.theme,
    notificationPreferences: {
      email: row.notification_preferences?.email ?? true,
      push: row.notification_preferences?.push ?? true,
      inApp: row.notification_preferences?.inApp ?? true,
    },
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}
