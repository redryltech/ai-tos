import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from '@ai-tos/shared';

export const PERMISSIONS_KEY = 'permissions';

/** `@RequirePermissions('users:manage')` — used with PermissionGuard. */
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
