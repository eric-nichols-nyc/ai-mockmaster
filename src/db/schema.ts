import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Interviews table
export const interviews = pgTable('interviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id).notNull(),
    title: text('title').notNull(),
    jobTitle: text('job_title').notNull(),
    jobDescription: text('job_description'),
    date: timestamp('date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Interview questions table
export const interviewQuestions = pgTable('interview_questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull(),
    question: text('question').notNull(),
    answer: text('answer'),
    feedback: text('answer'),
    suggested: text('answer'),
    createdAt: timestamp('created_at').defaultNow().notNull()
});