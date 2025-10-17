import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

// Vercel Postgres automatically uses POSTGRES_URL and other environment variables
const db = drizzle(sql);

export default db;

// Export the Database type for dependency injection
export type Database = typeof db;