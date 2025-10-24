import { createPool, sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// Verificar que tenemos las variables de entorno necesarias
const connectionString =
	process.env.POSTGRES_PRISMA_URL ||
	process.env.POSTGRES_URL_NON_POOLING ||
	process.env.POSTGRES_URL;

if (!connectionString) {
	console.error("No PostgreSQL connection string found");
	console.error(
		"Available env vars:",
		Object.keys(process.env).filter((key) => key.includes("POSTGRES")),
	);
	throw new Error(
		"POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING or POSTGRES_URL environment variable is required",
	);
}

console.log("Using pooled connection:", !!process.env.POSTGRES_PRISMA_URL);
console.log(
	"Connection type:",
	process.env.POSTGRES_PRISMA_URL ? "pooled" : "direct",
);

// Usar el cliente correcto según el tipo de conexión
const db = process.env.POSTGRES_PRISMA_URL
	? drizzle(createPool({ connectionString: process.env.POSTGRES_PRISMA_URL }), {
			schema,
		})
	: drizzle(sql, { schema });

export default db;

// Export the Database type for dependency injection
export type Database = typeof db;
