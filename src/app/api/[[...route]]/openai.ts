import { Hono } from 'hono'
import { OpenAI } from 'openai'
import uploadToS3 from '../../../lib/uploader'

const app = new Hono()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.post('/tts', async (c) => {
  try {
    const { text, voice } = await c.req.json()

    if (!text) {
      return c.json({ error: 'Text is required' }, 400)
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice || "alloy",
      input: text,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    const fileName = `speech-${Date.now()}.mp3`

    const audioUrl = await uploadToS3(buffer, fileName, 'audio/mpeg')

    return c.json({ audioUrl })

  } catch (error) {
    console.error('TTS Error:', error)
    return c.json({ error: 'Failed to generate speech' }, 500)
  }
})

export default app