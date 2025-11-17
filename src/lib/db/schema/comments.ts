import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { blogPosts } from "./blog";

export const blogComments = pgTable("blog_comments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("post_id", { length: 36 })
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "set null",
  }),
  name: text("name"),
  email: text("email"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;

