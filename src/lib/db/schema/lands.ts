/**
 * Land-related database schemas
 */

import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Lands table - main land entities
export const lands = pgTable("lands", {
	id: varchar("id", { length: 36 }).primaryKey(), // UUID
	name: text("name").notNull(),
	description: text("description").notNull(),
	area: integer("area").notNull(), // in acres or square meters
	price: integer("price").notNull(),
	currency: text("currency").notNull().default("USD"),
	location: text("location").notNull(), // general location description
	address: jsonb("address"), // specific address if available (Address object)
	type: text("type").notNull(), // LandType enum
	features: jsonb("features").notNull(), // LandFeatures object
	images: jsonb("images").default([]), // Array of Image objects
	status: text("status").notNull().default("available"), // available, sold, reserved, under-contract, archived
	userId: varchar("user_id", { length: 36 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Type inference
export type Land = typeof lands.$inferSelect;
export type NewLand = typeof lands.$inferInsert;
