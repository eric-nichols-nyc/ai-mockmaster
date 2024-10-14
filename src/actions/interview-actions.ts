"use server"

import { db } from "../db"
import { interviews, InterviewRecord } from "../db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const getInterviewByIdSchema = z.object({
  id: z.string().uuid(),
})

export async function getInterviewById(input: z.infer<typeof getInterviewByIdSchema>): Promise<InterviewRecord | null> {
  try {
    const { id } = getInterviewByIdSchema.parse(input)

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
