/**
 * Blog-related database schemas
 */

import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
	id: varchar("id", { length: 36 }).primaryKey(), // UUID
	title: text("title").notNull(),
	content: text("content").notNull(),
	excerpt: text("excerpt"),
	slug: text("slug").notNull().unique(),
	status: text("status").notNull().default("draft"), // draft, published, archived
	category: text("category").notNull(),
	tags: jsonb("tags").default([]), // Array of strings
	coverImage: jsonb("cover_image"), // Image object
	authorId: varchar("author_id", { length: 36 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	publishedAt: timestamp("published_at"),
	readTime: integer("read_time"), // estimated read time in minutes
	views: integer("views").default(0),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blog categories table
export const blogCategories = pgTable("blog_categories", {
	id: varchar("id", { length: 36 }).primaryKey(), // UUID
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	color: text("color"), // hex color for UI
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Type inference
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;
