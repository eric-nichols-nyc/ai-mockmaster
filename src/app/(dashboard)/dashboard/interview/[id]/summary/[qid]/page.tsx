import React from 'react'
import Summary from '../../../(components)/summary'
import { InterviewRecord } from '@/db/schema'
import { z } from "zod"
import { db } from "@/db"
import { interviews } from "@/db/schema"
import { eq } from "drizzle-orm"

const getInterviewByIdSchema = z.object({
  id: z.string().uuid(),
})

async function getInterviewById(input: z.infer<typeof getInterviewByIdSchema>): Promise<InterviewRecord | null> {
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

interface SummaryPageProps {
  params: {
    id: string;
    qid: string;
  }
}

const SummaryPage = async ({ params }: SummaryPageProps) => {
  const { id } = params;
  const interview = await getInterviewById({ id });

  if (!interview) {
    return <div>Error: Failed to load interview</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Summary />
    </div>
  )
}

export default SummaryPage
