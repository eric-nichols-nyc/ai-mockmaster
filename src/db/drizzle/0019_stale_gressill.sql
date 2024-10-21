ALTER TABLE "interview_questions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "interview_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD COLUMN "explanation" text;