CREATE TABLE "wizard_drafts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"wizard_type" text NOT NULL,
	"wizard_config_id" text NOT NULL,
	"form_data" jsonb NOT NULL,
	"current_step" text NOT NULL,
	"step_progress" jsonb DEFAULT '{}'::jsonb,
	"completion_percentage" integer DEFAULT 0,
	"title" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wizard_media" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"draft_id" varchar(36),
	"published_id" integer,
	"wizard_type" text NOT NULL,
	"media_type" text NOT NULL,
	"url" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255),
	"size" integer NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"display_order" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wizard_drafts" ADD CONSTRAINT "wizard_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_media" ADD CONSTRAINT "wizard_media_draft_id_wizard_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."wizard_drafts"("id") ON DELETE cascade ON UPDATE no action;