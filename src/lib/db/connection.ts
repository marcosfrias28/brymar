/**
 * Database connection utilities
 */

import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema/index";

// Verify environment variables
if (!process.env.POSTGRES_URL) {
	console.error("POSTGRES_URL environment variable is not set");
	console.error(
		"Available env vars:",
		Object.keys(process.env).filter((key) => key.includes("POSTGRES")),
	);
	throw new Error("POSTGRES_URL environment variable is required");
}

// Create database instance with schema
export const db = drizzle(sql, { schema });

// Export database type for dependency injection
export type Database = typeof db;

// Connection utilities
export async function testConnection(): Promise<boolean> {
	try {
		await sql`SELECT 1`;
		return true;
	} catch (error) {
		console.error("Database connection test failed:", error);
		return false;
	}
}

export async function closeConnection(): Promise<void> {
	try {
		await sql.end();
	} catch (error) {
		console.error("Error closing database connection:", error);
	}
}

// Transaction helper
export async function withTransaction<T>(
	callback: (tx: any) => Promise<T>,
): Promise<T> {
	return await db.transaction(callback);
}

// Database utilities - simplified for better type safety
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
