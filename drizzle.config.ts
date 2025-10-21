import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Para migraciones, usar conexión directa (no-pooled)
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL!,
  },
});
