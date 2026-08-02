import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/modules/**/*Schema.ts',
  dialect: 'postgresql',
  schemaFilter: 'public',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
