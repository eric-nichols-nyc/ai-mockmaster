ALTER TABLE "interviews" ALTER COLUMN "questions" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD COLUMN "feedback" text;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD COLUMN "suggested" text;