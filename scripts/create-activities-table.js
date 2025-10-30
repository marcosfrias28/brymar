/**
 * Script to create the user_activities table
 * Run this script to add the activities table to your database
 */

const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const {
	pgTable,
	text,
	timestamp,
	jsonb,
	uuid,
	varchar,
} = require("drizzle-orm/pg-core");

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error("DATABASE_URL environment variable is required");
	process.exit(1);
}

const sql = postgres(connectionString);
const _db = drizzle(sql);

// Define the activities table schema
const _userActivities = pgTable("user_activities", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	type: varchar("type", { length: 50 }).notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	details: text("details"),
	metadata: jsonb("metadata"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

async function createActivitiesTable() {
	try {
		console.log("Creating user_activities table...");

		// Create the table
		await sql`
			CREATE TABLE IF NOT EXISTS user_activities (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				user_id UUID NOT NULL,
				type VARCHAR(50) NOT NULL,
				title TEXT NOT NULL,
				description TEXT NOT NULL,
				details TEXT,
				metadata JSONB,
				ip_address VARCHAR(45),
				user_agent TEXT,
				created_at TIMESTAMP NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMP NOT NULL DEFAULT NOW()
			);
		`;

		// Add foreign key constraint to users table
		await sql`
			ALTER TABLE user_activities 
			ADD CONSTRAINT fk_user_activities_user_id 
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
		`;

		// Create indexes for better performance
		await sql`
			CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
		`;

		await sql`
			CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(type);
		`;

		await sql`
			CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);
		`;

		await sql`
			CREATE INDEX IF NOT EXISTS idx_user_activities_user_type_created ON user_activities(user_id, type, created_at);
		`;

		console.log("✅ user_activities table created successfully!");
		console.log("✅ Foreign key constraint added to users table");
		console.log("✅ Indexes created for better performance");
	} catch (error) {
		console.error("❌ Error creating user_activities table:", error);
		throw error;
	} finally {
		await sql.end();
	}
}

// Run the migration
createActivitiesTable()
	.then(() => {
		console.log("🎉 Migration completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Migration failed:", error);
		process.exit(1);
	});
