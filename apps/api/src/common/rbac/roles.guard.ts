import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser, RbacRoleKey } from '@ai-tos/shared';
import { ROLES_KEY } from './roles.decorator';
import { RbacService } from '../../modules/rbac/rbac.service';
import { resolveOrganizationId } from './org-context';

/** Enforces `@Roles()` against `organization_user_roles` (RBAC source of truth). */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RbacRoleKey[]>(ROLES_KEY, [
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
      throw new ForbiddenException('Organization context required for role check');
    }

    const ok = await this.rbac.hasAnyRole(orgId, user.id, required);
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
