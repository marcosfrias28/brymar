import { createPool, createClient, sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// Detección robusta de pooled/direct
const prismaUrl = process.env.POSTGRES_PRISMA_URL;
const pooledUrl = process.env.POSTGRES_URL;
const directUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_NO_SSL;

function isPooled(url?: string | null): boolean {
    if (!url) return false;
    return /pooler/i.test(url) || /pgbouncer=true/i.test(url);
}

let client:
    | ReturnType<typeof createPool>
    | ReturnType<typeof createClient>
    | typeof sql
    | null = null;

if (prismaUrl) {
    client = createPool({ connectionString: prismaUrl });
    console.log("DB(drizzle): using pooled connection via POSTGRES_PRISMA_URL");
} else if (directUrl) {
    client = createClient({ connectionString: directUrl });
    console.log("DB(drizzle): using direct connection via POSTGRES_URL_NON_POOLING/NO_SSL");
} else if (pooledUrl) {
    if (isPooled(pooledUrl)) {
        client = createPool({ connectionString: pooledUrl });
        console.log("DB(drizzle): using pooled connection via POSTGRES_URL");
    } else {
        client = createClient({ connectionString: pooledUrl });
        console.log("DB(drizzle): using direct connection via POSTGRES_URL");
    }
} else {
    // Fallback to env-based sql if nothing else is set
    client = sql;
    console.log("DB(drizzle): fallback to sql env client");
}

const db = drizzle(client as any, { schema });

export default db;

// Export the Database type for dependency injection
export type Database = typeof db;
