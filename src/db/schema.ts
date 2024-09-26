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

// Interview questions table (you might not need this anymore)
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
    createdAt: timestamp('created_at').defaultNow().notNull()
});


export type Interview = typeof interviews.$inferSelect;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;