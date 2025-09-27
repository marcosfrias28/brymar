CREATE TABLE "ai_generations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"property_id" integer,
	"draft_id" varchar(36),
	"user_id" varchar(36) NOT NULL,
	"generation_type" text NOT NULL,
	"input_data" jsonb NOT NULL,
	"generated_content" text NOT NULL,
	"model_used" varchar(100),
	"language" text DEFAULT 'es' NOT NULL,
	"success" boolean DEFAULT true,
	"error_message" text,
	"processing_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_characteristics" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" text NOT NULL,
	"property_type" text,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"created_by" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_draft_characteristics" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" varchar(36) NOT NULL,
	"characteristic_id" varchar(36) NOT NULL,
	"selected" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_drafts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"form_data" jsonb NOT NULL,
	"step_completed" integer DEFAULT 0,
	"title" text,
	"property_type" text,
	"completion_percentage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"property_id" integer,
	"draft_id" varchar(36),
	"user_id" varchar(36) NOT NULL,
	"url" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255),
	"size" integer NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"width" integer,
	"height" integer,
	"display_order" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_videos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"property_id" integer,
	"draft_id" varchar(36),
	"user_id" varchar(36) NOT NULL,
	"url" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255),
	"size" integer NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"duration" integer,
	"display_order" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wizard_analytics" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"session_id" varchar(100),
	"draft_id" varchar(36),
	"event_type" text NOT NULL,
	"step_number" integer,
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"time_spent_ms" integer,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_draft_id_property_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."property_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_characteristics" ADD CONSTRAINT "property_characteristics_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_draft_characteristics" ADD CONSTRAINT "property_draft_characteristics_draft_id_property_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."property_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_draft_characteristics" ADD CONSTRAINT "property_draft_characteristics_characteristic_id_property_characteristics_id_fk" FOREIGN KEY ("characteristic_id") REFERENCES "public"."property_characteristics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_drafts" ADD CONSTRAINT "property_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_draft_id_property_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."property_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_videos" ADD CONSTRAINT "property_videos_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_videos" ADD CONSTRAINT "property_videos_draft_id_property_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."property_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_videos" ADD CONSTRAINT "property_videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizard_analytics" ADD CONSTRAINT "wizard_analytics_draft_id_property_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."property_drafts"("id") ON DELETE cascade ON UPDATE no action;