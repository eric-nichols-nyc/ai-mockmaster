import { Hono } from 'hono'
import { db } from '@/db'
import { interviews, interviewQuestions } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { v4 as uuidv4 } from 'uuid';

const app = new Hono()

// Set up Clerk middleware
app.use('*', clerkMiddleware())

// Zod schemas
const createInterviewSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1),
    jobDescription: z.string().optional(),
    skills: z.array(z.string()),
    questions: z.array(z.object({
      question: z.string().min(1),
      suggested: z.string().min(1),
    })).nonempty(), // Ensure there's at least one question
  }),
})

const updateInterviewSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1).optional(),
    jobDescription: z.string().optional(),
  }),
})

const saveAnswerSchema = z.object({
  body: z.object({
    answer: z.string().min(1),
    audioUrl: z.string().url().optional(),
  }),
})

// GET / - List all interviews for the authenticated user
app.get('/', async (c) => {
  const auth = getAuth(c);
  console.log(auth)
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const data = await db.select()
      .from(interviews)
      .where(eq(interviews.userId, auth.userId))
      .orderBy(desc(interviews.createdAt))
    
    return c.json(data)
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return c.json({ error: 'Failed to fetch interviews' }, 500)
  }
})

// POST / - Create a new interview
app.post('/', zValidator('json', createInterviewSchema.shape.body), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const { jobTitle, jobDescription, skills, questions } = c.req.valid('json')

    const newInterview = await db.transaction(async (tx) => {
      const [interview] = await tx.insert(interviews).values({
        id: uuidv4(), // Generate a new UUID
        userId: auth.userId,
        jobTitle,
        jobDescription,
        skills,
        date: new Date(),
        completed: false,
        questions: JSON.stringify(questions) // Convert questions array to a JSON string
      }).returning()

      const interviewQuestionValues = questions.map(q => ({
        interviewId: interview.id,
        question: q.question,
      }))

      await tx.insert(interviewQuestions).values(interviewQuestionValues)
      console.log("interview======================", interview)
      return interview
    })

    return c.json(newInterview, 201)
  } catch (error) {
    console.error('Error creating interview:', error)
    return c.json({ error: 'Failed to create interview' }, 500)
  }
})

// GET /current - Fetch the current interview with its questions
app.get('/current', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const currentInterview = await db.select()
      .from(interviews)
      .where(eq(interviews.userId, auth.userId))
      .orderBy(desc(interviews.createdAt))
      .limit(1)

    if (currentInterview.length === 0) {
      return c.json({ error: 'No current interview found' }, 404)
    }

    const questions = await db.select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.interviewId, currentInterview[0].id))

    return c.json({ ...currentInterview[0], questions })
  } catch (error) {
    console.error('Error fetching current interview:', error)
    return c.json({ error: 'Failed to fetch current interview' }, 500)
  }
})

// GET /list/completed - Fetch all completed interviews for the authenticated user
app.get('/list/completed', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const completedInterviews = await db.select()
      .from(interviews)
      .where(and(
        eq(interviews.userId, auth.userId),
        eq(interviews.completed, true)
      ))
      .orderBy(desc(interviews.createdAt))
    
    return c.json(completedInterviews)
  } catch (error) {
    console.error('Error fetching completed interviews:', error)
    return c.json({ error: 'Failed to fetch completed interviews' }, 500)
  }
})

// POST /:id/questions/:questionId/answer - Save the recorded answer for a specific question
app.post('/:id/questions/:questionId/answer', zValidator('json', saveAnswerSchema.shape.body), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const interviewId = c.req.param('id')
  const questionId = c.req.param('questionId')

  try {
    const { answer, audioUrl } = c.req.valid('json')

    const updatedQuestion = await db.update(interviewQuestions)
    .set({ answer, audioUrl })
    .where(and(
      eq(interviewQuestions.id, questionId),
      eq(interviewQuestions.interviewId, interviewId)
    ))
      .returning()

    if (updatedQuestion.length === 0) {
      return c.json({ error: 'Question not found' }, 404)
    }

    return c.json(updatedQuestion[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error('Error saving answer:', error)
    return c.json({ error: 'Failed to save answer' }, 500)
  }
})

// GET /:id - Fetch a specific interview with its questions
app.get('/:id', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const id = c.req.param('id')
  try {
    const interview = await db.select()
      .from(interviews)
      .where(and(
        eq(interviews.id, id),
        eq(interviews.userId, auth.userId)
      ))

    if (interview.length === 0) {
      return c.json({ error: 'Interview not found' }, 404)
    }

    const questions = await db.select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.interviewId, id))

    return c.json({ ...interview[0], questions })
  } catch (error) {
    console.error('Error fetching interview:', error)
    return c.json({ error: 'Failed to fetch interview' }, 500)
  }
})

// PUT /:id - Update an existing interview
app.put('/:id', zValidator('json', updateInterviewSchema.shape.body), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const id = c.req.param('id')

  try {
    const { jobTitle, jobDescription } = c.req.valid('json')

    const updateData: Partial<typeof interviews.$inferInsert> = {}

    if (jobTitle !== undefined) updateData.jobTitle = jobTitle
    if (jobDescription !== undefined) updateData.jobDescription = jobDescription

    const updatedInterview = await db.update(interviews)
      .set(updateData)
       .where(and(
        eq(interviews.id, id),
        eq(interviews.userId, auth.userId)
      ))
      .returning()

    if (updatedInterview.length === 0) {
      return c.json({ error: 'Interview not found' }, 404)
    }

    return c.json(updatedInterview[0])
  } catch (error) {
    console.error(`Error updating interview with id ${id}:`, error)
    return c.json({ error: 'Failed to update interview' }, 500)
  }
})

// POST /:id/complete - Mark an interview as complete
app.post('/:id/complete', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const id = c.req.param('id')

  try {
    const completedInterview = await db.update(interviews)
      .set({ completed: true })
      .where(and(
        eq(interviews.id, id),
        eq(interviews.userId, auth.userId)
      ))
      .returning()

    if (completedInterview.length === 0) {
      return c.json({ error: 'Interview not found' }, 404)
    }

    return c.json(completedInterview[0])
  } catch (error) {
    console.error(`Error completing interview with id ${id}:`, error)
    return c.json({ error: 'Failed to complete interview' }, 500)
  }
})

export default app