ALTER TABLE "interview_questions" RENAME COLUMN "suggested_url" TO "suggested_audio_url";--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "suggested" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "improvements" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "key_takeaways" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "interview_questions" DROP COLUMN IF EXISTS "skills";--> statement-breakpoint
ALTER TABLE "interview_questions" DROP COLUMN IF EXISTS "saved";--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "job_description";--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "skills";--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "date";--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "completed";--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "questions";