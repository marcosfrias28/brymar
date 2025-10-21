/**
 * Wizard-related database schemas
 */

import {
    pgTable,
    varchar,
    text,
    timestamp,
    integer,
    jsonb,
    serial,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { properties } from "./properties";
import { lands } from "./lands";
import { blogPosts } from "./blog";

// Enums for wizard types
export const wizardTypeEnum = pgEnum("wizard_type", ["property", "land", "blog"]);
export const wizardStatusEnum = pgEnum("wizard_status", ["draft", "completed", "published", "archived"]);

// Wizard drafts table - unified for all wizard types
export const wizardDrafts = pgTable("wizard_drafts", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: wizardTypeEnum("type").notNull(), // property, land, blog
    status: wizardStatusEnum("status").notNull().default("draft"), // draft, completed, published, archived
    title: text("title").notNull(),
    description: text("description"),
    currentStep: integer("current_step").default(0),
    steps: jsonb("steps").notNull(), // Array of WizardStep objects
    data: jsonb("data").notNull().default({}), // Wizard form data
    completedAt: timestamp("completed_at"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wizard templates table - predefined wizard configurations
export const wizardTemplates = pgTable("wizard_templates", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    type: wizardTypeEnum("type").notNull(), // property, land, blog
    name: text("name").notNull(),
    description: text("description").notNull(),
    steps: jsonb("steps").notNull(), // Array of step definitions
    defaultData: jsonb("default_data").default({}),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI generations table - track AI content generation
export const aiGenerations = pgTable("ai_generations", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    draftId: varchar("draft_id", { length: 36 })
        .references(() => wizardDrafts.id, { onDelete: "cascade" }),
    type: wizardTypeEnum("type").notNull(), // property, land, blog
    generationType: text("generation_type").notNull(), // title, description, content, tags, etc.
    prompt: text("prompt").notNull(),
    context: jsonb("context").default({}),
    generatedContent: jsonb("generated_content").notNull(),
    model: text("model"), // AI model used
    confidence: integer("confidence"), // 0-100
    success: boolean("success").default(true),
    errorMessage: text("error_message"),
    processingTimeMs: integer("processing_time_ms"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wizard media table - unified media storage for all wizard types
export const wizardMedia = pgTable("wizard_media", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    draftId: varchar("draft_id", { length: 36 })
        .references(() => wizardDrafts.id, { onDelete: "cascade" }),
    propertyId: varchar("property_id", { length: 36 })
        .references(() => properties.id, { onDelete: "cascade" }),
    landId: varchar("land_id", { length: 36 })
        .references(() => lands.id, { onDelete: "cascade" }),
    blogPostId: varchar("blog_post_id", { length: 36 })
        .references(() => blogPosts.id, { onDelete: "cascade" }),
    type: wizardTypeEnum("type").notNull(), // wizard type: property, land, blog
    mediaType: text("media_type").notNull(), // image, video, document
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    originalFilename: text("original_filename"),
    size: integer("size").notNull(), // file size in bytes
    contentType: text("content_type").notNull(), // MIME type
    width: integer("width"), // for images
    height: integer("height"), // for images
    duration: integer("duration"), // for videos in seconds
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wizard analytics table - track wizard usage and performance
export const wizardAnalytics = pgTable("wizard_analytics", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    userId: varchar("user_id", { length: 36 })
        .references(() => users.id, { onDelete: "cascade" }),
    draftId: varchar("draft_id", { length: 36 })
        .references(() => wizardDrafts.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),
    type: wizardTypeEnum("type").notNull(), // property, land, blog
    eventType: text("event_type").notNull(), // step_started, step_completed, ai_generated, draft_saved, published
    stepNumber: integer("step_number"),
    eventData: jsonb("event_data").default({}),
    timeSpentMs: integer("time_spent_ms"),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type inference
export type WizardDraft = typeof wizardDrafts.$inferSelect;
export type NewWizardDraft = typeof wizardDrafts.$inferInsert;

export type WizardTemplate = typeof wizardTemplates.$inferSelect;
export type NewWizardTemplate = typeof wizardTemplates.$inferInsert;

export type AIGeneration = typeof aiGenerations.$inferSelect;
export type NewAIGeneration = typeof aiGenerations.$inferInsert;

export type WizardMedia = typeof wizardMedia.$inferSelect;
export type NewWizardMedia = typeof wizardMedia.$inferInsert;

export type WizardAnalytic = typeof wizardAnalytics.$inferSelect;
export type NewWizardAnalytic = typeof wizardAnalytics.$inferInsert;