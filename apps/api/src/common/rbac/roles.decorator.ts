import { SetMetadata } from '@nestjs/common';
import type { Role } from '@ai-tos/shared';

export const ROLES_KEY = 'roles';

/** `@Roles('admin')` — used with RolesGuard for RBAC. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
