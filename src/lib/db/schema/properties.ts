/**
 * Property-related database schemas
 */

import {
    pgTable,
    varchar,
    text,
    timestamp,
    integer,
    boolean,
    jsonb,
    serial,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Properties table - main property entities
export const properties = pgTable("properties", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("USD"),
    address: jsonb("address").notNull(), // Address object
    type: text("type").notNull(), // PropertyType enum
    features: jsonb("features").notNull(), // PropertyFeatures object
    images: jsonb("images").default([]), // Array of Image objects
    status: text("status").notNull().default("draft"), // draft, published, sold, rented, archived
    featured: boolean("featured").default(false),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Property favorites - user favorites
export const propertyFavorites = pgTable("property_favorites", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    propertyId: varchar("property_id", { length: 36 })
        .notNull()
        .references(() => properties.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Property views - track property views for analytics
export const propertyViews = pgTable("property_views", {
    id: serial("id").primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
        .notNull()
        .references(() => properties.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
        .references(() => users.id, { onDelete: "set null" }), // nullable for anonymous views
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Property inquiries - contact forms for properties
export const propertyInquiries = pgTable("property_inquiries", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    propertyId: varchar("property_id", { length: 36 })
        .notNull()
        .references(() => properties.id, { onDelete: "cascade" }),
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
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type PropertyFavorite = typeof propertyFavorites.$inferSelect;
export type NewPropertyFavorite = typeof propertyFavorites.$inferInsert;

export type PropertyView = typeof propertyViews.$inferSelect;
export type NewPropertyView = typeof propertyViews.$inferInsert;

export type PropertyInquiry = typeof propertyInquiries.$inferSelect;
export type NewPropertyInquiry = typeof propertyInquiries.$inferInsert;