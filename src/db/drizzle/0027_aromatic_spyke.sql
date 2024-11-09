ALTER TABLE "interview_questions" ALTER COLUMN "job_title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "job_title" SET NOT NULL;