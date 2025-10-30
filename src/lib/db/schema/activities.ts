import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userActivities = pgTable("user_activities", {
	id: varchar("id", { length: 36 }).primaryKey(), // Changed from uuid to varchar to match user ID format
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	type: varchar("type", { length: 50 }).notNull(), // view, favorite, search, contact, message, login, profile, settings
	title: text("title").notNull(),
	description: text("description").notNull(),
	details: text("details"), // Optional additional details
	metadata: jsonb("metadata"), // Additional data like property ID, search terms, etc.
	ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
	userAgent: text("user_agent"), // Browser/device info
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Performance indexes for userActivities table
export const userActivitiesIndexes = {
	// Index on userId for fast user-specific queries
	userIdIdx: sql`CREATE INDEX IF NOT EXISTS "user_activities_user_id_idx" ON "user_activities" ("user_id")`,

	// Index on createdAt for fast ordering
	createdAtIdx: sql`CREATE INDEX IF NOT EXISTS "user_activities_created_at_idx" ON "user_activities" ("created_at")`,

	// Composite index for optimal user + time queries
	userIdCreatedAtIdx: sql`CREATE INDEX IF NOT EXISTS "user_activities_user_id_created_at_idx" ON "user_activities" ("user_id", "created_at")`,

	// Index on type for filtering
	typeIdx: sql`CREATE INDEX IF NOT EXISTS "user_activities_type_idx" ON "user_activities" ("type")`,
};
