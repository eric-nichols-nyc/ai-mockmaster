ALTER TABLE "interview_questions" ADD COLUMN "audio_url" text;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "skills" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;