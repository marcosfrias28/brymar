-- Add land drafts table
CREATE TABLE IF NOT EXISTS "land_drafts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"form_data" jsonb NOT NULL,
	"step_completed" integer DEFAULT 0,
	"title" text,
	"land_type" text,
	"completion_percentage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add blog drafts table
CREATE TABLE IF NOT EXISTS "blog_drafts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"form_data" jsonb NOT NULL,
	"step_completed" integer DEFAULT 0,
	"title" text,
	"category" text,
	"completion_percentage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Update wizard analytics table to support all wizard types
ALTER TABLE "wizard_analytics" ADD COLUMN IF NOT EXISTS "wizard_type" text NOT NULL DEFAULT 'property';
ALTER TABLE "wizard_analytics" ADD COLUMN IF NOT EXISTS "land_draft_id" varchar(36);
ALTER TABLE "wizard_analytics" ADD COLUMN IF NOT EXISTS "blog_draft_id" varchar(36);

-- Rename existing draft_id column to property_draft_id for clarity
ALTER TABLE "wizard_analytics" RENAME COLUMN "draft_id" TO "property_draft_id";

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "land_drafts" ADD CONSTRAINT "land_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "blog_drafts" ADD CONSTRAINT "blog_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_land_draft_id_land_drafts_id_fk" FOREIGN KEY ("land_draft_id") REFERENCES "land_drafts"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_blog_draft_id_blog_drafts_id_fk" FOREIGN KEY ("blog_draft_id") REFERENCES "blog_drafts"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "land_drafts_user_id_idx" ON "land_drafts" ("user_id");
CREATE INDEX IF NOT EXISTS "land_drafts_updated_at_idx" ON "land_drafts" ("updated_at");
CREATE INDEX IF NOT EXISTS "blog_drafts_user_id_idx" ON "blog_drafts" ("user_id");
CREATE INDEX IF NOT EXISTS "blog_drafts_updated_at_idx" ON "blog_drafts" ("updated_at");
CREATE INDEX IF NOT EXISTS "wizard_analytics_wizard_type_idx" ON "wizard_analytics" ("wizard_type");