import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser, PermissionKey } from '@ai-tos/shared';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { RbacService } from '../../modules/rbac/rbac.service';
import { resolveOrganizationId } from './org-context';

/** Enforces `@RequirePermissions()` via RBAC role→permission mappings (not membership). */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params?: Record<string, string>;
      headers?: Record<string, string | string[] | undefined>;
    }>();
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const orgId = resolveOrganizationId(req);
    if (!orgId) {
      throw new ForbiddenException('Organization context required for permission check');
    }

    const ok = await this.rbac.hasAnyPermission(orgId, user.id, required);
    if (!ok) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
