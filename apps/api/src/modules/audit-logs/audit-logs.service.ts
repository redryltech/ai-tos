import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import type { AuditAction, AuditLog, AuthUser } from '@ai-tos/shared';
import { RbacService } from '../rbac/rbac.service';
import {
  MANAGER_AUDIT_RESOURCES,
  resourceForAction,
  toPublicAuditLog,
} from './audit.utils';
import { AuditLogsRepository } from './audit-logs.repository';

export interface RecordAuditInput {
  action: AuditAction;
  organizationId?: string | null;
  userId?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
  resource?: string;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    private readonly repo: AuditLogsRepository,
    @Inject(forwardRef(() => RbacService))
    private readonly rbac: RbacService,
  ) {}

  /** Best-effort append — never throws to callers. */
  async record(event: RecordAuditInput): Promise<void> {
    try {
      await this.repo.insert({
        organizationId: event.organizationId,
        userId: event.userId,
        action: event.action,
        resource: event.resource ?? resourceForAction(event.action),
        resourceId: event.resourceId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
      });
    } catch (err) {
      this.logger.warn(
        `Failed to write audit log action=${event.action}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async listForOrganization(
    actor: AuthUser,
    organizationId: string,
    query: {
      userId?: string;
      action?: string;
      from?: string;
      to?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ items: AuditLog[]; total: number; limit: number; offset: number }> {
    const elevated = await this.rbac.hasAnyRole(organizationId, actor.id, ['owner', 'admin']);
    const isManager = await this.rbac.hasAnyRole(organizationId, actor.id, ['manager']);
    if (!elevated && !isManager) {
      // PermissionGuard should already block; belt-and-suspenders.
      return { items: [], total: 0, limit: 0, offset: 0 };
    }

    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
    const offset = Math.max(query.offset ?? 0, 0);

    const { rows, total } = await this.repo.list({
      organizationId,
      userId: query.userId,
      action: query.action,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      resources: elevated ? undefined : MANAGER_AUDIT_RESOURCES,
      limit,
      offset,
    });

    return {
      items: rows.map(toPublicAuditLog),
      total,
      limit,
      offset,
    };
  }
}
