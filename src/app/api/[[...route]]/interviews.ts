import { Hono } from 'hono'
import { db } from '@/db'
import { interviews } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

const app = new Hono()

app.post('/', (c) => c.json('create an author', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

app.get('/', async (c) => {
  try {
    const data = await db.select().from(interviews).orderBy(desc(interviews.createdAt))
    console.log('allInterviews', data)
    return c.json(data)
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return c.json({ error: 'Failed to fetch interviews' }, 500)
  }
})

// app.get('/:id', async (c) => {
//   const id = c.req.param('id')
//   try {
//     const interview = await db.select().from(interviews).where(eq(interviews.id, id)).limit(1)
//     if (interview.length === 0) {
//       return c.json({ error: 'Interview not found' }, 404)
//     }
//     return c.json(interview[0])
//   } catch (error) {
//     console.error('Error fetching interview:', error)
//     return c.json({ error: 'Failed to fetch interview' }, 500)
//   }
// })

export default app