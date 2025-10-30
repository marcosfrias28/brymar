#!/usr/bin/env node

/**
 * Migration script to update existing lands from 'available' status to 'published'
 * This assumes that existing lands are complete and should be published
 */

const { drizzle } = require("drizzle-orm/postgres-js");
const { eq, sql } = require("drizzle-orm");
const postgres = require("postgres");
const { lands } = require("../src/lib/db/schema/lands");

async function migrateLandsStatus() {
	console.log("🚀 Starting lands status migration...");

	// Database connection
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		console.error("❌ DATABASE_URL environment variable is required");
		process.exit(1);
	}

	const client = postgres(connectionString);
	const db = drizzle(client);

	try {
		// Update all lands with status 'available' to 'published'
		const result = await db
			.update(lands)
			.set({
				status: "published",
				updatedAt: new Date(),
			})
			.where(eq(lands.status, "available"));

		console.log(
			`✅ Successfully updated ${result.rowCount || 0} lands from 'available' to 'published'`
		);

		// Show current status distribution
		const statusCounts = await db
			.select({
				status: lands.status,
				count: sql`count(*)`,
			})
			.from(lands)
			.groupBy(lands.status);

		console.log("\n📊 Current status distribution:");
		statusCounts.forEach(({ status, count }) => {
			console.log(`  ${status}: ${count}`);
		});
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await client.end();
	}

	console.log("✅ Migration completed successfully!");
}

// Run the migration
if (require.main === module) {
	migrateLandsStatus().catch(console.error);
}

module.exports = { migrateLandsStatus };
