CREATE TYPE "public"."wizard_status" AS ENUM('draft', 'completed', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."wizard_type" AS ENUM('property', 'land', 'blog');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"account_id" varchar(100) NOT NULL,
	"provider_id" varchar(100) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"draft_id" varchar(36),
	"type" "wizard_type" NOT NULL,
	"generation_type" text NOT NULL,
	"prompt" text NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb,
	"generated_content" jsonb NOT NULL,
	"model" text,
	"confidence" integer,
	"success" boolean DEFAULT true,
	"error_message" text,
	"processing_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_post_comments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"post_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"parent_id" varchar(36),
	"author_name" text NOT NULL,
	"author_email" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_post_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"slug" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"category" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"cover_image" jsonb,
	"author_id" varchar(36) NOT NULL,
	"published_at" timestamp,
	"read_time" integer,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "land_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"land_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_inquiries" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"land_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"land_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lands" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"area" integer NOT NULL,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"location" text NOT NULL,
	"address" jsonb,
	"type" text NOT NULL,
	"features" jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'available' NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"read" boolean DEFAULT false,
	"read_at" timestamp,
	"action_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"address" jsonb NOT NULL,
	"type" text NOT NULL,
	"features" jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false,
	"user_id" varchar(36) NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_inquiries" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100),
	"first_name" varchar(50),
	"last_name" varchar(50),
	"phone" varchar(20),
	"avatar" text,
	"role" text DEFAULT 'user' NOT NULL,
	"email_verified" timestamp,
	"phone_verified" timestamp,
	"preferences" jsonb DEFAULT '{"theme":"light","language":"en","notifications":{"email":true,"push":true,"marketing":false},"privacy":{"profileVisible":true,"contactInfoVisible":false}}'::jsonb,
	"last_login_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wizard_analytics" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"draft_id" varchar(36),
	"session_id" text,
	"type" "wizard_type" NOT NULL,
	"event_type" text NOT NULL,
	"step_number" integer,
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"time_spent_ms" integer,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wizard_drafts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"type" "wizard_type" NOT NULL,
	"status" "wizard_status" DEFAULT 'draft' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"current_step" integer DEFAULT 0,
	"steps" jsonb NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wizard_media" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"draft_id" varchar(36),
	"property_id" varchar(36),
	"land_id" varchar(36),
	"blog_post_id" varchar(36),
	"type" "wizard_type" NOT NULL,
	"media_type" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"original_filename" text,
	"size" integer NOT NULL,
	"content_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wizard_templates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"type" "wizard_type" NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"steps" jsonb NOT NULL,
	"default_data" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_draft_id_wizard_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."wizard_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_comments" ADD CONSTRAINT "blog_post_comments_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_comments" ADD CONSTRAINT "blog_post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_views" ADD CONSTRAINT "blog_post_views_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_views" ADD CONSTRAINT "blog_post_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_favorites" ADD CONSTRAINT "land_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_favorites" ADD CONSTRAINT "land_favorites_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_inquiries" ADD CONSTRAINT "land_inquiries_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_inquiries" ADD CONSTRAINT "land_inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_views" ADD CONSTRAINT "land_views_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_views" ADD CONSTRAINT "land_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lands" ADD CONSTRAINT "lands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_favorites" ADD CONSTRAINT "property_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_favorites" ADD CONSTRAINT "property_favorites_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_draft_id_wizard_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."wizard_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_drafts" ADD CONSTRAINT "wizard_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_media" ADD CONSTRAINT "wizard_media_draft_id_wizard_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."wizard_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_media" ADD CONSTRAINT "wizard_media_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_media" ADD CONSTRAINT "wizard_media_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_media" ADD CONSTRAINT "wizard_media_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;