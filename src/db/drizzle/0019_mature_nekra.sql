ALTER TABLE "interview_questions" RENAME COLUMN "suggested_audio_url" TO "suggested_url";--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "improvements" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "key_takeaways" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "suggested" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD COLUMN "skills" text[];--> statement-breakpoint
ALTER TABLE "interview_questions" ADD COLUMN "saved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "job_description" text;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "skills" text[];--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "questions" jsonb NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "interview_questions" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "updated_at";