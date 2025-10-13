CREATE TABLE "blog_drafts" (
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
--> statement-breakpoint
CREATE TABLE "land_drafts" (
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
--> statement-breakpoint
ALTER TABLE "wizard_analytics" DROP CONSTRAINT "wizard_analytics_draft_id_property_drafts_id_fk";
--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD COLUMN "wizard_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD COLUMN "property_draft_id" varchar(36);--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD COLUMN "land_draft_id" varchar(36);--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD COLUMN "blog_draft_id" varchar(36);--> statement-breakpoint
ALTER TABLE "blog_drafts" ADD CONSTRAINT "blog_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_drafts" ADD CONSTRAINT "land_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_property_draft_id_property_drafts_id_fk" FOREIGN KEY ("property_draft_id") REFERENCES "public"."property_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_land_draft_id_land_drafts_id_fk" FOREIGN KEY ("land_draft_id") REFERENCES "public"."land_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_blog_draft_id_blog_drafts_id_fk" FOREIGN KEY ("blog_draft_id") REFERENCES "public"."blog_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" DROP COLUMN "draft_id";