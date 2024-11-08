import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import webhook from './webhooks'
import interviews from './interviews'
import upload from './upload'
import openai from './openai'
const app = new Hono().basePath('/api')
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'PUT',"DELETE"],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
)
app.get('/', (c) => {
  console.log(interviews)
  return c.json({
    message: 'Hello Next.js!',
  })
})

app.route('/webhooks', webhook)
app.route('/interviews', interviews)
app.route('/upload', upload)
app.route('/openai', openai)


export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)