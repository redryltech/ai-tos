import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import * as argon2 from 'argon2';
import { loadConfig } from '@ai-tos/config';

const SEED_FILE = join(__dirname, '..', '..', 'seeds', 'seed.sql');

async function main() {
  const client = new pg.Client({ connectionString: loadConfig().DATABASE_URL });
  await client.connect();
  try {
    const sql = readFileSync(SEED_FILE, 'utf8');
    await client.query(sql);

    // Phase 1.1 bootstrap admin (dev/staging only password — rotate in production).
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@ai-tos.local';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await client.query(
      `INSERT INTO users (email, role, password_hash, password_algo, is_active)
       VALUES ($1, 'admin', $2, 'argon2id', true)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             password_algo = EXCLUDED.password_algo,
             role = EXCLUDED.role,
             is_active = true,
             updated_at = now()`,
      [email, passwordHash],
    );

    console.log(`seed complete (admin=${email})`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
