import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { loadConfig } from '@ai-tos/config';

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

async function main() {
  const client = new pg.Client({ connectionString: loadConfig().DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    );
    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const exists = await client.query(`SELECT 1 FROM _migrations WHERE name = $1`, [file]);
      if (exists.rowCount && exists.rowCount > 0) continue;
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      console.log(`migrated: ${file}`);
    }
    console.log('migrations complete');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
