import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import webhook from './webhook'
import interviews from './interviews'
import question from './question'
import upload from './upload'
import transcript from './transcript'
const app = new Hono().basePath('/api')

app.get('/', (c) => {
  console.log(interviews)
  return c.json({
    message: 'Hello Next.js!',
  })
})

app.route('/webhook', webhook)
app.route('/interviews', interviews)
app.route('/question', question)
app.route('/upload', upload)
app.route('/transcript', transcript)


export const GET = handle(app)
export const POST = handle(app)