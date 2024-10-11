import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  question: string;
  suggested: string;
  answer?: string;
  audioUrl?: string;
  feedback?: string;
  improvements: string[];
  keyTakeaways: string[];
  grade?: string;
  skills: string[];
  saved: boolean;
  createdAt: Date;
}

// Users table (unchanged)
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Updated Interviews table
export const interviews = pgTable('interviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id).notNull(),
    jobTitle: text('job_title').notNull(),
    jobDescription: text('job_description'),
    skills: text('skills').array(),
    date: timestamp('date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completed: boolean('completed').default(false).notNull(),
    questions: jsonb('questions').notNull().$type<InterviewQuestion[]>()
});

// Updated Interview questions table with optional skills reference
export const interviewQuestions = pgTable('interview_questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull(),
    question: text('question').notNull(),
    suggested: text('suggested').notNull(),
    answer: text('answer'),
    audioUrl: text('audio_url'),
    feedback: text('feedback'),
    improvements: text('improvements').array(),
    keyTakeaways: text('key_takeaways').array(),
    grade: text('grade'),
    skills: text('skills').array(),
    saved: boolean('saved').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export type InterviewRecord = typeof interviews.$inferSelect;
export type InterviewQuestionRecord = typeof interviewQuestions.$inferSelect;

// Note: The 'skills' field in interviewQuestions is an optional array of text that corresponds to the 'skills' field in the interviews table.
// This allows each question to be optionally associated with specific skills from the interview.
