ALTER TABLE "interview_questions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "interview_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "interview_questions" DROP COLUMN IF EXISTS "explanation";