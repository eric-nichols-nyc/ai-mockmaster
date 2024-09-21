import { Hono } from 'hono'
import { OpenAI } from 'openai'

const app = new Hono()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ... (keep the existing /tts endpoint)

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
    
    Provide the questions in the following JSON format:
    {
      "questions": [
        {
          "question": "Question text here"
        },
        ...
      ]
    }
    
    Ensure the questions are relevant to the provided information and cover a range of topics suitable for the position.`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates interview questions." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    })

    const questions = JSON.parse(response.choices[0].message.content || '{"questions": []}')
    console.log("generatedQuestions======================", questions)

    return c.json({questions})

  } catch (error) {
    console.error('Question Generation Error:', error)
    return c.json({ error: 'Failed to generate interview questions' }, 500)
  }
})

export default app