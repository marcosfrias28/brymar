ALTER TABLE "lands" ADD COLUMN "location" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lands" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lands" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lands" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "area" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "location" text NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "province";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "garage";