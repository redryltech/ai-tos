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

/** JWT payload (foundation; no user store yet). */
export interface AuthTokenPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
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

export {};
