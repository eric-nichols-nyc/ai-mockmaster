"use server"

import { db } from "../db"
import { interviews, InterviewRecord } from "../db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { auth } from '@clerk/nextjs/server';

const getInterviewByIdSchema = z.object({
  id: z.string().uuid(),
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
