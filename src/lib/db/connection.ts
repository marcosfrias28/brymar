/**
 * Database connection utilities
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

// Load environment variables from .env file
config();

// Configurazione semplificata con Neon Database
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL must be set for Neon Database connection");
}

// Crea la connessione HTTP serverless con Neon
const sql = neon(connectionString);

// Create database instance with schema
export const db = drizzle(sql, { schema });

// Export SQL connection for direct queries (commented out to avoid conflicts with Drizzle ORM sql)
// export { sql };

// Type export
export type Database = typeof db;

// Test connection function
export async function testConnection(): Promise<boolean> {
	try {
		await sql`SELECT 1`;
		return true;
	} catch (_error) {
		return false;
	}
}

// Close connection function (no-op for HTTP connections)
export async function closeConnection(): Promise<void> {}

// Transaction wrapper
export async function withTransaction<T>(
	callback: (tx: any) => Promise<T>
): Promise<T> {
	// Per ora usiamo il db direttamente, Neon supporta transazioni
	return callback(db);
}

// Export Drizzle operators for convenience
export {
	and,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	isNotNull,
	isNull,
	like,
	lt,
	lte,
	notInArray,
	or,
} from "drizzle-orm";
