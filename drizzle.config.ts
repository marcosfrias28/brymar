import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

export default defineConfig({
	schema: "./src/lib/db/schema/index.ts",
	out: "./src/lib/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		// Usa DATABASE_URL per Neon Database
		url: process.env.DATABASE_URL!,
	},
});
