import { NextResponse } from 'next/server'
import { db } from '../../../../db'
import { interviews } from '../../../../db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'edge'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const interview = await db.select().from(interviews).where(eq(interviews.id, id)).limit(1)
    if (interview.length === 0) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }
    return NextResponse.json(interview[0])
  } catch (error) {
    console.error(`Error fetching interview with id ${id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch interview' }, { status: 500 })
  }
}