import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// user Table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for user ID
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// session Table
export const session = pgTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for session ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id), // FK to user.id
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// account Table
export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for account ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id), // FK to user.id
  accountId: varchar("account_id", { length: 100 }).notNull(),
  providerId: varchar("provider_id", { length: 100 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"), // For email/password auth
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Verification Table
export const verification = pgTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for verification ID
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 36 })
    .notNull()
    .references(() => users.id), // FK to user.id
  createdAt: timestamp("created_at").defaultNow(),
});

// Services Table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

// Reviews Table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  rating: varchar("rating"),
  body: varchar("body"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id), // FK to user.id
});

// Properties Table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  area: integer("area").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(),
  images: jsonb("images").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lands Table
export const lands = pgTable("lands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  area: integer("area").notNull(),
  price: integer("price").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  images: jsonb("images").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull().default("property-news"),
  status: text("status").notNull().default("draft"),
  image: text("image"),
  readingTime: integer("reading_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type Inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Land = typeof lands.$inferSelect;
export type NewLand = typeof lands.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
