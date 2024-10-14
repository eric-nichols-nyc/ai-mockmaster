import { Hono } from 'hono'
import { db } from '../../../db'
import { interviews, interviewQuestions, InterviewQuestion } from '../../../db/schema'
import { desc, eq, and, exists } from 'drizzle-orm'
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

const updateQuestionSchema = z.object({
  body: z.object({
    feedback: z.string().optional(),
    improvements: z.array(z.string()).optional(),
    keyTakeaways: z.array(z.string()).optional(),
    grade: z.string().optional(),
    saved: z.boolean().optional()
  }),
})

// New schema for updating the saved status of a question
const updateQuestionSavedSchema = z.object({
  body: z.object({
    saved: z.boolean()
  })
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
      const interviewId = uuidv4();
      const formattedQuestions: InterviewQuestion[] = questions.map(q => ({
        id: uuidv4(),
        interviewId: interviewId,
        question: q.question,
        suggested: q.suggested,
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
        userId: auth.userId,
        jobTitle,
        jobDescription,
        skills,
        date: new Date(),
        completed: false,
        questions: formattedQuestions
      }).returning()

      await tx.insert(interviewQuestions).values(formattedQuestions)
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

// PUT /:id/questions/:questionId/answer - Save the recorded answer for a specific question
app.put('/:id/questions/:questionId/answer', zValidator('json', saveAnswerSchema.shape.body), async (c) => {
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

// PUT /:id/questions/:questionId - Update a specific question with feedback, improvements, keyTakeaways, and grade
app.put('/:id/questions/:questionId', zValidator('json', updateQuestionSchema.shape.body), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const interviewId = c.req.param('id')
  const questionId = c.req.param('questionId')

  try {
    const { feedback, improvements, keyTakeaways, grade, saved } = c.req.valid('json')

    // First, verify that the interview belongs to the authenticated user
    const interviewCheck = await db.select({ id: interviews.id })
      .from(interviews)
      .where(and(
        eq(interviews.id, interviewId),
        eq(interviews.userId, auth.userId)
      ))

    if (interviewCheck.length === 0) {
      return c.json({ error: 'Interview not found or unauthorized' }, 404)
    }

    const updateData: Partial<typeof interviewQuestions.$inferInsert> = {}

    if (feedback !== undefined) updateData.feedback = feedback
    if (improvements !== undefined) updateData.improvements = improvements
    if (keyTakeaways !== undefined) updateData.keyTakeaways = keyTakeaways
    if (grade !== undefined) updateData.grade = grade
    if (saved !== undefined) updateData.saved = saved


    const updatedQuestion = await db.update(interviewQuestions)
      .set(updateData)
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
    console.error(`Error updating question with id ${questionId} in interview ${interviewId}:`, error)
    return c.json({ error: 'Failed to update question' }, 500)
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

app.get('/:id/questions/:questionId', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const interviewId = c.req.param('id')
  const questionId = c.req.param('questionId')

  try {
    // First, verify that the interview belongs to the authenticated user
    const interviewCheck = await db.select({ id: interviews.id })
      .from(interviews)
      .where(and(
        eq(interviews.id, interviewId),
        eq(interviews.userId, auth.userId)
      ))

    if (interviewCheck.length === 0) {
      return c.json({ error: 'Interview not found or unauthorized' }, 404)
    }

    const question = await db.select()
      .from(interviewQuestions)
      .where(and(
        eq(interviewQuestions.id, questionId),
        eq(interviewQuestions.interviewId, interviewId)
      ))

    if (question.length === 0) {
      return c.json({ error: 'Question not found' }, 404)
    }

    return c.json(question[0])
  } catch (error) {
    console.error(`Error fetching question with id ${questionId} from interview ${interviewId}:`, error)
    return c.json({ error: 'Failed to fetch question' }, 500)
  }
})

// Corrected route: GET /saved-questions - Fetch all interviews with saved questions for the authenticated user
app.get('/saved-questions', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const interviewsWithSavedQuestions = await db
      .select({
        id: interviews.id,
        jobTitle: interviews.jobTitle,
        date: interviews.date,
      })
      .from(interviews)
      .where(
        and(
          eq(interviews.userId, auth.userId),
          exists(
            db.select()
              .from(interviewQuestions)
              .where(
                and(
                  eq(interviewQuestions.interviewId, interviews.id),
                  eq(interviewQuestions.saved, true)
                )
              )
          )
        )
      )
      .orderBy(desc(interviews.date));

    // Fetch saved questions for each interview
    const interviewsWithQuestions = await Promise.all(
      interviewsWithSavedQuestions.map(async (interview) => {
        const savedQuestions = await db
          .select()
          .from(interviewQuestions)
          .where(
            and(
              eq(interviewQuestions.interviewId, interview.id),
              eq(interviewQuestions.saved, true)
            )
          );

        return {
          ...interview,
          questions: savedQuestions,
        };
      })
    );

    return c.json(interviewsWithQuestions);
  } catch (error) {
    console.error('Error fetching interviews with saved questions:', error);
    return c.json({ error: 'Failed to fetch interviews with saved questions' }, 500);
  }
});

// Corrected route: GET /list/saved-questions - Fetch all interviews with saved questions for the authenticated user
app.get('/list/saved-questions', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const interviewsWithSavedQuestions = await db
      .select({
        id: interviews.id,
        jobTitle: interviews.jobTitle,
        date: interviews.date,
      })
      .from(interviews)
      .where(
        and(
          eq(interviews.userId, auth.userId),
          exists(
            db.select()
              .from(interviewQuestions)
              .where(
                and(
                  eq(interviewQuestions.interviewId, interviews.id),
                  eq(interviewQuestions.saved, true)
                )
              )
          )
        )
      )
      .orderBy(desc(interviews.date));

    // Fetch saved questions for each interview
    const interviewsWithQuestions = await Promise.all(
      interviewsWithSavedQuestions.map(async (interview) => {
        const savedQuestions = await db
          .select()
          .from(interviewQuestions)
          .where(
            and(
              eq(interviewQuestions.interviewId, interview.id),
              eq(interviewQuestions.saved, true)
            )
          );

        return {
          ...interview,
          questions: savedQuestions,
        };
      })
    );
      return c.json(interviewsWithQuestions);
    } catch (error) {
      console.error('Error fetching interviews with saved questions:', error);
      return c.json({ error: 'Failed to fetch interviews with saved questions' }, 500);
    }
  });

  // New route: PUT /:id/questions/:questionId/save - Update the saved status of a specific question
app.put('/:id/questions/:questionId/save', zValidator('json', updateQuestionSavedSchema.shape.body), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const interviewId = c.req.param('id')
  const questionId = c.req.param('questionId')
  const { saved } = c.req.valid('json')

  try {
    // First, verify that the interview belongs to the authenticated user
    const interviewCheck = await db.select({ id: interviews.id })
      .from(interviews)
      .where(and(
        eq(interviews.id, interviewId),
        eq(interviews.userId, auth.userId)
      ))

    if (interviewCheck.length === 0) {
      return c.json({ error: 'Interview not found or unauthorized' }, 404)
    }

    // Update the saved status of the question
    const updatedQuestion = await db.update(interviewQuestions)
      .set({ saved })
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
    console.error(`Error updating saved status for question ${questionId} in interview ${interviewId}:`, error)
    return c.json({ error: 'Failed to update question saved status' }, 500)
  }
})

export default app
