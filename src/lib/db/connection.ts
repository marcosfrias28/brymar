/**
 * Database connection utilities
 */

import { createClient, createPool } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema/index";

// Build a robust connection that supports pooled and direct strings
const prismaUrl = process.env.POSTGRES_PRISMA_URL;
const pooledUrl = process.env.POSTGRES_URL;
const directUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_NO_SSL;

function isPooled(url?: string | null): boolean {
    if (!url) return false;
    return /pooler/i.test(url) || /pgbouncer=true/i.test(url);
}

// Choose the right client based on available envs
let client: ReturnType<typeof createPool> | ReturnType<typeof createClient> | null = null;

if (prismaUrl) {
    // Prisma URL is pooled by convention
    client = createPool({ connectionString: prismaUrl });
    console.log("DB: using pooled connection via POSTGRES_PRISMA_URL");
} else if (directUrl) {
    client = createClient({ connectionString: directUrl });
    console.log("DB: using direct connection via POSTGRES_URL_NON_POOLING/NO_SSL");
} else if (pooledUrl) {
    if (isPooled(pooledUrl)) {
        client = createPool({ connectionString: pooledUrl });
        console.log("DB: using pooled connection via POSTGRES_URL");
    } else {
        client = createClient({ connectionString: pooledUrl });
        console.log("DB: using direct connection via POSTGRES_URL");
    }
}

if (!client) {
    console.error("No PostgreSQL connection string found");
    console.error(
        "Available env vars:",
        Object.keys(process.env).filter((key) => key.includes("POSTGRES")),
    );
    throw new Error(
        "POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL or POSTGRES_URL must be set",
    );
}

// Create database instance with schema
export const db = drizzle(client, { schema });

// Export database type for dependency injection
export type Database = typeof db;

// Connection utilities
export async function testConnection(): Promise<boolean> {
    try {
        // @ts-ignore - both client types expose sql tag
        await client.sql`SELECT 1`;
        return true;
    } catch (error) {
        console.error("Database connection test failed:", error);
        return false;
    }
}

export async function closeConnection(): Promise<void> {
    try {
        await client!.end();
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
