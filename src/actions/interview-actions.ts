"use server"

import { db } from "../db"
import { interviews, interviewQuestions, InterviewRecord } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { auth } from '@clerk/nextjs/server';

const getInterviewByIdSchema = z.object({
  id: z.string().uuid(),
})

const getInterviewAndQuestionSchema = z.object({
  questionId: z.string().uuid(),
})

export async function getInterviews() {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  return await db.select().from(interviews).where(eq(interviews.userId, userId))
}

export async function getInterviewById(input: z.infer<typeof getInterviewByIdSchema>): Promise<InterviewRecord | null> {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { id } = getInterviewByIdSchema.parse(input)

    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, id),
    })

    // Optionally, you can add a check here to ensure the interview belongs to the current user
    // if (interview && interview.userId !== userId) {
    //   throw new Error("Unauthorized")
    // }

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

export async function getInterviewAndQuestion(input: z.infer<typeof getInterviewAndQuestionSchema>) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { questionId } = getInterviewAndQuestionSchema.parse(input)

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

    // Return both the interview and the specific question
    return {
      interview,
      question
    }
  } catch (error) {
    console.error(`Error fetching interview and question for question ID ${input.questionId}:`, error)
    throw new Error("Failed to fetch interview and question")
  }
}
