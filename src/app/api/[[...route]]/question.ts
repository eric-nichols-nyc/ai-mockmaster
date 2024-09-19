import { Hono } from 'hono'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// Initialize the Google Generative AI
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!

// throw error is no API key is provided
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable')
}
const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
})

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
]

// Define the schema for input validation
const questionSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

app.post('/getquestion', zValidator('json', questionSchema), async (c) => {
  try {
    const { message } = await c.req.valid('json')

    const chatSession = model.startChat({
      generationConfig,
      safetySettings
    })

    const result = await chatSession.sendMessage(message)
    const response = result.response.text()

    return c.json({ response })
  } catch (error) {
    console.error('Error:', error)
    return c.json({ error: 'An error occurred while processing your request' }, 500)
  }
})

export default app