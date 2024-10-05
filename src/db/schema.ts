import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

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
    skills: text('skills').array().notNull(),
    date: timestamp('date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completed: boolean('completed').default(false).notNull(),
    questions: jsonb('questions')
});

// Updated Interview questions table with optional skills reference
export const interviewQuestions = pgTable('interview_questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    grade: text('grade'),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull(),
    question: text('question').notNull(),
    audioUrl: text('audio_url'),
    answer: text('answer'),
    feedback: text('feedback'),
    suggested: text('suggested'),
    improvements: text('improvements').array(),
    keyTakeaways: text('key_takeaways').array(),
    skills: text('skills').array(), // Made skills optional by removing .notNull()
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Interview = typeof interviews.$inferSelect;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;

// Note: The 'skills' field in interviewQuestions is an optional array of text that corresponds to the 'skills' field in the interviews table.
// This allows each question to be optionally associated with specific skills from the interview.