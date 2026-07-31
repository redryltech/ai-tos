import pg from 'pg';
import { loadConfig } from '@ai-tos/config';

const { Pool } = pg;

let pool: pg.Pool | null = null;

/** Shared, lazily-created connection pool (PgBouncer/rds-proxy recommended in prod). */
export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: loadConfig().DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

export async function query(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult> {
  return getPool().query(text, params as unknown[]);
}
