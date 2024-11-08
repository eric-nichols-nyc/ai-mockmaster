"use server"

import { db } from "../db"
import { interviews, interviewQuestions, InterviewRecord, InterviewQuestionRecord } from "../db/schema";
import { UpdateInterviewQuestionSchema } from "@/lib/schemas";
import { eq, and, desc } from "drizzle-orm"
import { z } from "zod"
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  GetInterviewByIdSchema,
  GetInterviewAndQuestionSchema,
  DeleteQuestionSchema,
  CreateInterviewSchema
} from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';
import { type InterviewQuestion } from '../db/schema';

export async function getInterviews() {
  const { userId } = auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return await db.select().from(interviews).where(eq(interviews.userId, userId))
}

export async function getInterviewById(input: z.infer<typeof GetInterviewByIdSchema>): Promise<InterviewRecord | null> {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { id } = GetInterviewByIdSchema.parse(input)

    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, id),
    })

    return interview || null
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return null
    }
    console.error("Error fetching interview:", error)
    return null
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = auth()
  return userId
}

export async function getInterviewAndQuestion(input: z.infer<typeof GetInterviewAndQuestionSchema>) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { questionId } = GetInterviewAndQuestionSchema.parse(input)

    // First, fetch the question and its associated interview ID
    const questionResult = await db.select({
      question: interviewQuestions,
      interviewId: interviewQuestions.interviewId
    })
      .from(interviewQuestions)
      .where(eq(interviewQuestions.id, questionId))
      .limit(1)

    if (questionResult.length === 0) {
      throw new Error("Question not found")
    }

    const { question, interviewId } = questionResult[0]

    // Now, fetch the interview
    const interviewResult = await db.select()
      .from(interviews)
      .where(and(
        eq(interviews.id, interviewId),
        eq(interviews.userId, userId)
      ))
      .limit(1)

    if (interviewResult.length === 0) {
      throw new Error("Interview not found or unauthorized")
    }

    const interview = interviewResult[0]

    return {
      interview,
      question
    }
  } catch (error) {
    console.error(`Error fetching interview and question for question ID ${input.questionId}:`, error)
    throw new Error("Failed to fetch interview and question")
  }
}

export async function getAllUserQuestions(): Promise<InterviewQuestionRecord[]> {
  const { userId } = auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    const questions = await db
      .select({
        question: interviewQuestions
      })
      .from(interviewQuestions)
      .innerJoin(interviews, eq(interviews.id, interviewQuestions.interviewId))
      .where(eq(interviews.userId, userId))
      .orderBy(desc(interviewQuestions.createdAt))

    return questions.map(q => q.question)
  } catch (error) {
    console.error("Error fetching user questions:", error)
    throw new Error("Failed to fetch user questions")
  }
}

export async function deleteQuestionAndInterview(input: z.infer<typeof DeleteQuestionSchema>) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { questionId } = DeleteQuestionSchema.parse(input);

  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Get the interview ID associated with the question
      const question = await tx.query.interviewQuestions.findFirst({
        where: eq(interviewQuestions.id, questionId),
        columns: { interviewId: true }
      });

      if (!question) {
        throw new Error("Question not found");
      }

      // Delete the question
      await tx.delete(interviewQuestions).where(eq(interviewQuestions.id, questionId));

      // Delete the associated interview
      await tx.delete(interviews).where(eq(interviews.id, question.interviewId));
    });

    // Revalidate the dashboard page to reflect the changes
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error("Error deleting question and interview:", error);
    return { success: false, error: "Failed to delete question and interview" };
  }
}

export async function createInterview(input: z.infer<typeof CreateInterviewSchema>) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const { body } = CreateInterviewSchema.parse(input);
    const { jobTitle, jobDescription, skills, questions } = body;

    const newInterview = await db.transaction(async (tx) => {
      const interviewId = uuidv4();
      const formattedQuestions: InterviewQuestion[] = questions.map(q => ({
        id: uuidv4(),
        interviewId: interviewId,
        question: q.question,
        explanation: null,
        suggested: q.suggested,
        suggestedAudioUrl: null,
        answer: null,
        audioUrl: null,
        feedback: null,
        improvements: null,
        keyTakeaways: null,
        grade: null,
        skills: null,
        saved: false,
        createdAt: new Date()
      }));

      const [interview] = await tx.insert(interviews).values({
        id: interviewId,
        userId,
        jobTitle,
        jobDescription,
        skills,
        date: new Date(),
        completed: false,
        questions: formattedQuestions
      }).returning();

      await tx.insert(interviewQuestions).values(formattedQuestions);
      return interview;
    });

    // revalidatePath('/dashboard');
    return { success: true, data: newInterview };
  } catch (error) {
    console.error('Error creating interview:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' };
    }
    return { success: false, error: 'Failed to create new interview' };
  }
}

export async function updateInterviewQuestion(data: z.infer<typeof UpdateInterviewQuestionSchema>) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  try {
    const { interviewId, questionId, updates } = UpdateInterviewQuestionSchema.parse(data);

    // Verify interview ownership
    const interview = await db.query.interviews.findFirst({
      where: and(
        eq(interviews.id, interviewId),
        eq(interviews.userId, userId)
      ),
    });

    if (!interview) throw new Error("Interview not found");

    // Update the question with all provided fields
    const updatedQuestion = await db
      .update(interviewQuestions)
      .set({
        ...updates,
      })
      .where(and(
        eq(interviewQuestions.id, questionId),
        eq(interviewQuestions.interviewId, interviewId)
      ))
      .returning();

    if (!updatedQuestion.length) {
      throw new Error("Question not found");
    }

    // If all questions are completed, update interview status
    if (updates.isCompleted) {
      const allQuestions = await db.query.interviewQuestions.findMany({
        where: eq(interviewQuestions.interviewId, interviewId),
      });
      
      const allCompleted = allQuestions.every(q => q.saved);
      if (allCompleted) {
        await db.update(interviews)
          .set({ completed: true })
          .where(eq(interviews.id, interviewId));
      }
    }
    console.log("updatedQuestion", updatedQuestion);
    return updatedQuestion[0];
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}
