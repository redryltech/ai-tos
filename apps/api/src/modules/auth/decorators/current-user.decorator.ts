import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@ai-tos/shared';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    return req.user;
  },
);
