/**
 * @ai-tos/shared — cross-cutting domain types and validation schemas.
 * Phase 0: foundation types only. No business logic.
 */

import { z } from 'zod';

/** RBAC roles (Vol 03 / Task 09). */
export const RoleSchema = z.enum(['guest', 'user', 'admin', 'system']);
export type Role = z.infer<typeof RoleSchema>;

/** Platform modes (Vol 01). Phase 0 exposes shell + health only. */
export const PlatformModeSchema = z.enum([
  'learn',
  'analysis',
  'paper',
  'assisted',
  'auto',
  'portfolio',
  'strategy_lab',
  'coach',
  'admin',
]);
export type PlatformMode = z.infer<typeof PlatformModeSchema>;

/** Service health contract (every service exposes /health). */
export const HealthStatusSchema = z.enum(['ok', 'degraded', 'error']);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export interface HealthCheck {
  status: HealthStatus;
  service: string;
  version: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

/** Standard API envelope. */
export interface ApiResponse<T> {
  data: T;
  error: null;
}
export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

/** JWT access-token payload (Phase 1.1). */
export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: Role;
  typ: 'access' | 'refresh';
  jti: string;
  iat?: number;
  exp?: number;
}

/** Authenticated request principal. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/** Generic event envelope used by the future event bus (Vol 04). */
export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  from: string;
  ts: string;
  correlationId: string;
  payload: T;
}

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: RoleSchema,
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

/**
 * Tenancy vs authorization (Phase 1 stabilization):
 *
 * - `organization_members` = membership only (is the user in this org?).
 *   The `role` column on members is a legacy tenancy label for invites/display —
 *   it must NEVER be used for API authorization.
 * - `organization_user_roles` (+ role_permissions) = single authz source of truth.
 *   All permission checks use RbacService / RolesGuard / PermissionGuard.
 */
/** Organization membership labels (tenancy only — not authorization). */
export const OrgMemberRoleSchema = z.enum(['owner', 'admin', 'member']);
export type OrgMemberRole = z.infer<typeof OrgMemberRoleSchema>;

/** Frozen org RBAC roles — authorization source of truth (Phase 1.3). */
export const RbacRoleKeySchema = z.enum(['owner', 'admin', 'manager', 'analyst', 'viewer']);
export type RbacRoleKey = z.infer<typeof RbacRoleKeySchema>;

export const RbacResourceSchema = z.enum([
  'organization',
  'users',
  'roles',
  'reports',
  'watchlists',
  'portfolio',
  'ai_engines',
  'api_keys',
  'settings',
  'audit_logs',
]);
export type RbacResource = z.infer<typeof RbacResourceSchema>;

export const RbacActionSchema = z.enum(['create', 'read', 'update', 'delete', 'manage']);
export type RbacAction = z.infer<typeof RbacActionSchema>;

export type PermissionKey = `${RbacResource}:${RbacAction}`;

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z.string().min(2).max(64),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

/** User profile theme preference (Phase 1.4). */
export const ProfileThemeSchema = z.enum(['light', 'dark', 'system']);
export type ProfileTheme = z.infer<typeof ProfileThemeSchema>;

export const NotificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  inApp: z.boolean().default(true),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export const UserProfileSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(1).max(120).nullable(),
  avatarUrl: z.string().url().max(2048).nullable(),
  phone: z.string().min(3).max(32).nullable(),
  timezone: z.string().min(1).max(64),
  language: z.string().min(2).max(16),
  theme: ProfileThemeSchema,
  notificationPreferences: NotificationPreferencesSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/** Organization API key providers (Phase 1.5). */
export const ApiKeyProviderSchema = z.enum([
  'openai',
  'google_gemini',
  'anthropic_claude',
  'market_data',
  'broker',
  'email',
  'telegram_bot',
  'webhook',
  'custom',
]);
export type ApiKeyProvider = z.infer<typeof ApiKeyProviderSchema>;

export const ApiKeyStatusSchema = z.enum(['active', 'revoked']);
export type ApiKeyStatus = z.infer<typeof ApiKeyStatusSchema>;

/** Public API key view — never includes ciphertext or plaintext. */
export const ApiKeyPublicSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  provider: ApiKeyProviderSchema,
  name: z.string().min(1).max(120),
  keyLast4: z.string().length(4),
  status: ApiKeyStatusSchema,
  createdBy: z.string().uuid(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiKeyPublic = z.infer<typeof ApiKeyPublicSchema>;

/** Authenticated user session (Phase 1.6) — never exposes refresh token material. */
export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid().nullable(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
  lastActiveAt: z.string(),
  expiresAt: z.string(),
  revokedAt: z.string().nullable(),
  isCurrent: z.boolean().optional(),
});
export type UserSession = z.infer<typeof UserSessionSchema>;

/** Audit log actions (Phase 1.7). */
export const AuditActionSchema = z.enum([
  'auth.login',
  'auth.logout',
  'auth.token_refresh',
  'organization.create',
  'organization.update',
  'organization.delete',
  'organization.invite',
  'organization.invite_accept',
  'rbac.role_assign',
  'rbac.role_revoke',
  'profile.update',
  'api_key.create',
  'api_key.update',
  'api_key.revoke',
  'api_key.delete',
  'session.revoke',
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid().nullable(),
  userId: z.string().uuid().nullable(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export {};
