import { NextResponse } from 'next/server'
import { db } from '../../../db'
import { interviews } from '../../../db/schema'

// export const runtime = 'edge'

export async function GET() {
  try {
    const allInterviews = await db.select().from(interviews)
    console.log('allInterviews', allInterviews)
    return NextResponse.json(allInterviews)
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 })
  }
}