import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import type { AuditLogRow } from './audit.utils';

export interface AuditInsert {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditListFilters {
  organizationId: string;
  userId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  resources?: readonly string[];
  limit: number;
  offset: number;
}

@Injectable()
export class AuditLogsRepository {
  async insert(event: AuditInsert): Promise<AuditLogRow> {
    const result = await query(
      `INSERT INTO audit_logs (
         organization_id, user_id, action, resource, resource_id,
         ip_address, user_agent, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING id, organization_id, user_id, action, resource, resource_id,
                 ip_address, user_agent, metadata, created_at`,
      [
        event.organizationId ?? null,
        event.userId ?? null,
        event.action,
        event.resource,
        event.resourceId ?? null,
        event.ipAddress ?? null,
        event.userAgent ?? null,
        JSON.stringify(event.metadata ?? {}),
      ],
    );
    return result.rows[0] as AuditLogRow;
  }

  async list(filters: AuditListFilters): Promise<{ rows: AuditLogRow[]; total: number }> {
    const params: unknown[] = [filters.organizationId];
    const where: string[] = ['organization_id = $1'];

    if (filters.userId) {
      params.push(filters.userId);
      where.push(`user_id = $${params.length}`);
    }
    if (filters.action) {
      params.push(filters.action);
      where.push(`action = $${params.length}`);
    }
    if (filters.from) {
      params.push(filters.from.toISOString());
      where.push(`created_at >= $${params.length}`);
    }
    if (filters.to) {
      params.push(filters.to.toISOString());
      where.push(`created_at <= $${params.length}`);
    }
    if (filters.resources && filters.resources.length > 0) {
      params.push([...filters.resources]);
      where.push(`resource = ANY($${params.length}::text[])`);
    }

    const whereSql = where.join(' AND ');
    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM audit_logs WHERE ${whereSql}`,
      params,
    );
    const total = Number((countResult.rows[0] as { total: number }).total);

    params.push(filters.limit);
    const limitIdx = params.length;
    params.push(filters.offset);
    const offsetIdx = params.length;

    const result = await query(
      `SELECT id, organization_id, user_id, action, resource, resource_id,
              ip_address, user_agent, metadata, created_at
       FROM audit_logs
       WHERE ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return { rows: result.rows as AuditLogRow[], total };
  }
}
