import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Phase 0 audit interceptor (skeleton).
 * Later phases persist structured audit records; here we log the call shape.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    console.log('[audit]', req.method, req.url);
    return next.handle();
  }
}
