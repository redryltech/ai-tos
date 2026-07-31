import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { loadConfig } from '@ai-tos/config';

const SEED_FILE = join(__dirname, '..', '..', 'seeds', 'seed.sql');

async function main() {
  const client = new pg.Client({ connectionString: loadConfig().DATABASE_URL });
  await client.connect();
  try {
    const sql = readFileSync(SEED_FILE, 'utf8');
    await client.query(sql);
    console.log('seed complete');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
