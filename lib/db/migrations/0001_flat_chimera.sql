ALTER TABLE "blog_posts" RENAME COLUMN "author_id" TO "author";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "category" text DEFAULT 'property-news' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "reading_time" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "updated_at" timestamp DEFAULT now();