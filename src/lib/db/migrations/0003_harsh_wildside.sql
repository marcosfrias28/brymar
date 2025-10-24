ALTER TABLE "user_activities" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "user_activities" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_activities" ALTER COLUMN "user_id" SET DATA TYPE text;