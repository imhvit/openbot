import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as guildSchema from '@/db/schemas/guild';
import * as userSchema from '@/db/schemas/user';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle({ client: pool, schema: { ...guildSchema, ...userSchema } });
