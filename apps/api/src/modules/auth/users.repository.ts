import { Injectable } from '@nestjs/common';
import { query } from '@ai-tos/database';
import type { Role } from '@ai-tos/shared';

export interface UserRecord {
  id: string;
  email: string;
  role: Role;
  password_hash: string | null;
  is_active: boolean;
}

@Injectable()
export class UsersRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await query(
      `SELECT id, email, role, password_hash, is_active
       FROM users WHERE lower(email) = lower($1) LIMIT 1`,
      [email],
    );
    return (result.rows[0] as UserRecord | undefined) ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await query(
      `SELECT id, email, role, password_hash, is_active
       FROM users WHERE id = $1 LIMIT 1`,
      [id],
    );
    return (result.rows[0] as UserRecord | undefined) ?? null;
  }
}
