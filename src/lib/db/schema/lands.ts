/**
 * Land-related database schemas
 */

import {
    pgTable,
    varchar,
    text,
    timestamp,
    integer,
    jsonb,
    serial,
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

// Land favorites - user favorites
export const landFavorites = pgTable("land_favorites", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    landId: varchar("land_id", { length: 36 })
        .notNull()
        .references(() => lands.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Land views - track land views for analytics
export const landViews = pgTable("land_views", {
    id: serial("id").primaryKey(),
    landId: varchar("land_id", { length: 36 })
        .notNull()
        .references(() => lands.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
        .references(() => users.id, { onDelete: "set null" }), // nullable for anonymous views
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Land inquiries - contact forms for lands
export const landInquiries = pgTable("land_inquiries", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    landId: varchar("land_id", { length: 36 })
        .notNull()
        .references(() => lands.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
        .references(() => users.id, { onDelete: "set null" }), // nullable for anonymous inquiries
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"), // new, contacted, closed
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Type inference
export type Land = typeof lands.$inferSelect;
export type NewLand = typeof lands.$inferInsert;

export type LandFavorite = typeof landFavorites.$inferSelect;
export type NewLandFavorite = typeof landFavorites.$inferInsert;

export type LandView = typeof landViews.$inferSelect;
export type NewLandView = typeof landViews.$inferInsert;

export type LandInquiry = typeof landInquiries.$inferSelect;
export type NewLandInquiry = typeof landInquiries.$inferInsert;