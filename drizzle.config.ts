import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schemas/*.ts',
  dialect: 'postgresql',
  schemaFilter: 'public',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
