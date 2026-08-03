import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  isProfileTheme,
  mergeNotificationPreferences,
  toPublicProfile,
} from './profile.utils';

describe('profile.utils', () => {
  it('validates theme values', () => {
    assert.equal(isProfileTheme('light'), true);
    assert.equal(isProfileTheme('dark'), true);
    assert.equal(isProfileTheme('system'), true);
    assert.equal(isProfileTheme('neon'), false);
  });

  it('merges notification preferences partially', () => {
    const merged = mergeNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES, {
      email: false,
    });
    assert.deepEqual(merged, { email: false, push: true, inApp: true });
  });

  it('maps row to public profile', () => {
    const profile = toPublicProfile({
      user_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Ada',
      avatar_url: null,
      phone: null,
      timezone: 'UTC',
      language: 'en',
      theme: 'system',
      notification_preferences: { email: true, push: false, inApp: true },
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-02T00:00:00.000Z'),
    });
    assert.equal(profile.fullName, 'Ada');
    assert.equal(profile.theme, 'system');
    assert.equal(profile.notificationPreferences.push, false);
    assert.equal(profile.createdAt, '2026-01-01T00:00:00.000Z');
  });
});
