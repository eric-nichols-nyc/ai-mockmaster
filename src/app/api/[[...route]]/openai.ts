import { Hono } from 'hono'
import { OpenAI } from 'openai'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const app = new Hono()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ... (keep the existing /tts endpoint if it exists)

app.post('/generate-questions', async (c) => {
  try {
    const { jobTitle, jobDescription, skills } = await c.req.json()

    if (!jobTitle || !jobDescription || !skills) {
      return c.json({ error: 'Title, description, and skills are required' }, 400)
    }

    const prompt = `Generate 5 interview questions based on the following information:
    Title: ${jobTitle}
    Description: ${jobDescription}
    Required Skills: ${skills}
    
    Provide the questions and suggested answers in the following JSON format:
    {
      "questions": [
        {
          "question": "Question text here",
          "suggested": "A detailed suggested answer for the question"
        },
        ...
      ]
    }
    
    Ensure the questions are relevant to the provided information and cover a range of topics suitable for the position. The suggested answers should be comprehensive and demonstrate a strong understanding of the topic.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates interview questions and suggested answers." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const questionsAndAnswers = JSON.parse(response.choices[0].message.content || '{"questions": []}')
    console.log('questionsAndAnswers = ',questionsAndAnswers)
    return c.json(questionsAndAnswers)

  } catch (error) {
    console.error('Question and Answer Generation Error:', error)
    return c.json({ error: 'Failed to generate interview questions and answers' }, 500)
  }
})

app.post('/text-to-speech', async (c) => {
    try {
      const { text } = await c.req.json()
  
      if (!text) {
        return c.json({ error: 'Text is required' }, 400)
      }
  
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: text,
      })
  
      const buffer = Buffer.from(await mp3.arrayBuffer())
      const fileName = `${uuidv4()}.mp3`
      const filePath = path.join(process.cwd(), 'public', 'audio', fileName)
  
      // Ensure the directory exists
      fs.mkdirSync(path.join(process.cwd(), 'public', 'audio'), { recursive: true })
  
      fs.writeFileSync(filePath, buffer)
  
      const audioUrl = `/audio/${fileName}`
  
      return c.json({ audioUrl })
  
    } catch (error) {
      console.error('Text-to-Speech Error:', error)
      return c.json({ error: 'Failed to generate audio' }, 500)
    }
  })
  
export default app