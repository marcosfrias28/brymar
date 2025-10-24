import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * User profiles table for extended profile information
 * Stores additional profile data beyond basic Better Auth fields
 */
export const userProfiles = pgTable("user_profiles", {
	userId: text("user_id")
		.notNull()
		.unique() // Unique constraint for upsert operations
		.references(() => users.id, { onDelete: "cascade" }),
	firstName: text("first_name"),
	lastName: text("last_name"),
	phone: text("phone"),
	location: text("location"),
	website: text("website"),
	bio: text("bio"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User profile indexes for better performance
export const userProfilesIndexes = {
	userIdIdx: `CREATE INDEX IF NOT EXISTS "user_profiles_user_id_idx" ON "user_profiles" ("user_id")`,
	createdAtIdx: `CREATE INDEX IF NOT EXISTS "user_profiles_created_at_idx" ON "user_profiles" ("created_at")`,
};

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
