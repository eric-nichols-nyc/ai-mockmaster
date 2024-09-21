ALTER TABLE "interviews" ADD COLUMN "questions" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "title";