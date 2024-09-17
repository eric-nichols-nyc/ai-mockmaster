import { Hono } from 'hono'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from "@/db"
import { users } from '@/db/schema'
import { log } from '@/log'
import { eq } from 'drizzle-orm'

const app = new Hono()

async function validateRequest(request: Request, secret: string) {
  const payloadString = await request.text()
  const headerPayload = request.headers

  const svixHeaders = {
    'svix-id': headerPayload.get('svix-id')!,
    'svix-timestamp': headerPayload.get('svix-timestamp')!,
    'svix-signature': headerPayload.get('svix-signature')!,
  }
  const wh = new Webhook(secret)

  try {
    return wh.verify(payloadString, svixHeaders) as WebhookEvent
  } catch (e) {
    console.error('incoming webhook failed verification')
    return
  }
}

app.post('/', async (c) => {
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    throw new Error('CLERK_CLERK_WEBHOOK_SECRET environment variable is missing')
  }

  const payload = await validateRequest(c.req.raw, process.env.CLERK_WEBHOOK_SECRET!)

  if (!payload) {
    return c.json(
      { error: 'webhook verification failed or payload was malformed' },
      400
    )
  }

  const { type, data } = payload

  log.trace(`clerk webhook payload: ${data.id}, ${type}`)

  if (type === 'user.created') {
    return createUser(data.id, data.first_name!, data.email_addresses[0].email_address, data.created_at)
  } else if (type === 'user.deleted') {
    return deleteUser(data.id)
  } else {
    log.warn(`${c.req.url} received event type "${type}", but no handler is defined for this type`)
    return c.json({
      error: `unrecognised payload type: ${type}`
    }, 400)
  }
})

async function createUser(id: string, name: string, email: string, createdAt: number) {
  log.info('creating user due to clerk webhook')
  await db.insert(users).values({
    id,
    name,
    email,
    createdAt: new Date(createdAt)
  })

  return new Response(JSON.stringify({ message: 'user created' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function deleteUser(id?: string) {
  if (id) {
    log.info('delete user due to clerk webhook')
    await db.delete(users).where(
      eq(users.id, id)
    )

    return new Response(JSON.stringify({ message: 'user deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } else {
    log.warn('clerk sent a delete user request, but no user ID was included in the payload')
    return new Response(JSON.stringify({ message: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export default app