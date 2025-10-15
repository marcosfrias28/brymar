import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

// Simple approach - just create the connection
// Environment variables should be loaded before importing this module
if (!process.env.POSTGRES_URL) {
    console.warn('POSTGRES_URL environment variable not found. Make sure .env is loaded.');
}

const db = drizzle(sql);

export default db;

// Export the Database type for dependency injection
export type Database = typeof db;