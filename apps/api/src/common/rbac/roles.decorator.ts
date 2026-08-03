import { SetMetadata } from '@nestjs/common';
import type { RbacRoleKey } from '@ai-tos/shared';

export const ROLES_KEY = 'roles';

/** `@Roles('owner', 'admin')` — used with RolesGuard for org RBAC. */
export const Roles = (...roles: RbacRoleKey[]) => SetMetadata(ROLES_KEY, roles);
